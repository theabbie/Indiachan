import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Posts } from '@/lib/db/posts';
import { Boards } from '@/lib/db/boards';
import { Bans } from '@/lib/db/bans';
import { Modlogs } from '@/lib/db/modlogs';
import { ObjectId } from '@/lib/db';
import { getIp } from '@/lib/ip';
import { getCollection as getPostsCollection } from '@/lib/db/posts';

interface ActionRequest {
  checkedposts: number[];
  postpassword?: string;
  delete?: boolean;
  delete_file?: boolean;
  unlink_file?: boolean;
  spoiler?: boolean;
  ban?: boolean;
  global_ban?: boolean;
  ban_reason?: string;
  ban_duration?: number;
  ban_appeal?: boolean;
  report?: boolean;
  global_report?: boolean;
  report_reason?: string;
  dismiss?: boolean;
  global_dismiss?: boolean;
  checkedreports?: string[];
  report_ban?: boolean;
  global_report_ban?: boolean;
  delete_ip_board?: boolean;
  delete_ip_global?: boolean;
  delete_ip_thread?: boolean;
  sticky?: number;
  lock?: boolean;
  bumplock?: boolean;
  cyclic?: boolean;
  move?: boolean;
  move_to_thread?: number;
  move_to_board?: string;
  log_message?: string;
  hide_name?: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const session = await requireSession();
    const body: ActionRequest = await request.json();
    const board = await Boards.findOne(boardId);

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    if (!body.checkedposts || body.checkedposts.length === 0) {
      return NextResponse.json(
        { error: 'Must select at least one post' },
        { status: 400 }
      );
    }

    const posts = await Posts.getPosts(boardId, body.checkedposts, true);

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'Selected posts not found' },
        { status: 404 }
      );
    }

    const messages: string[] = [];
    const modlogActions: number[] = [];
    const ip = await getIp(request);

    if (body.delete || body.delete_ip_board || body.delete_ip_global || body.delete_ip_thread) {
      let postsToDelete = [...posts];

      if (body.delete_ip_board || body.delete_ip_global || body.delete_ip_thread) {
        const deletePostIps = posts.map((p: any) => p.ip.cloak);
        const deletePostMongoIds = posts.map((p: any) => p._id);
        
        let query: any = {
          '_id': {
            '$nin': deletePostMongoIds.map((id: string) => new ObjectId(id))
          },
          'ip.cloak': {
            '$in': deletePostIps
          }
        };

        if (body.delete_ip_thread) {
          const threads = [...new Set(posts.map((p: any) => p.thread || p.postId))];
          query['board'] = boardId;
          query['$or'] = [
            {
              'thread': {
                '$in': threads
              }
            },
            {
              'postId': {
                '$in': threads
              }
            }
          ];
        } else if (body.delete_ip_board) {
          query['board'] = boardId;
        }

        const postsDb = await getPostsCollection();
        const deleteIpPosts = await postsDb.find(query).toArray();
        postsToDelete = postsToDelete.concat(deleteIpPosts);
      }

      if (body.delete_file) {
        const postsDb = await getPostsCollection();
        await postsDb.updateMany(
          {
            '_id': {
              '$in': postsToDelete.map((p: any) => new ObjectId(p._id))
            }
          },
          {
            '$set': {
              'files': []
            }
          }
        );
      }

      const postIds = postsToDelete.map((p: any) => new ObjectId(p._id));
      const postsDb = await getPostsCollection();
      await postsDb.deleteMany({
        '_id': {
          '$in': postIds
        }
      });

      messages.push(`Deleted ${postsToDelete.length} post(s)`);
      
      if (body.delete) {
        modlogActions.push(1);
      } else if (body.delete_ip_board) {
        modlogActions.push(2);
      } else if (body.delete_ip_global) {
        modlogActions.push(3);
      }

      const threadIds = [...new Set(postsToDelete.filter((p: any) => p.thread).map((p: any) => p.thread))];
      for (const threadId of threadIds) {
        const thread = await Posts.getPost(boardId, threadId);
        if (thread) {
          const postsDb = await getPostsCollection();
          const replies = await postsDb.find({
            'board': boardId,
            'thread': threadId
          }).toArray();
          
          await postsDb.updateOne(
            {
              'board': boardId,
              'postId': threadId
            },
            {
              '$set': {
                'replyposts': replies.length,
                'replyfiles': replies.reduce((acc: number, r: any) => acc + r.files.length, 0)
              }
            }
          );
        }
      }
    }

    if (body.ban || body.global_ban) {
      const banReason = body.ban_reason || 'No reason provided';
      const banDuration = body.ban_duration || 0;
      const banAppeal = body.ban_appeal !== false;

      for (const post of posts) {
        const existingBan = await Bans.find(post.ip.cloak, boardId);
        
        if (!existingBan) {
          await Bans.insertOne({
            ip: post.ip,
            reason: banReason,
            board: body.global_ban ? null : boardId,
            posts: [{ board: post.board, postId: post.postId }],
            issuer: session.user!,
            date: new Date(),
            expireAt: banDuration > 0 ? new Date(Date.now() + banDuration) : null,
            allowAppeal: banAppeal,
            seen: false,
            appeal: null
          });
        }
      }

      messages.push(`Banned ${posts.length} user(s)`);
      modlogActions.push(body.global_ban ? 5 : 4);
    }

    if (body.spoiler) {
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': posts.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'files.$[].spoiler': true
          }
        }
      );
      messages.push(`Spoilered ${posts.length} post(s)`);
      modlogActions.push(6);
    }

    if (body.unlink_file) {
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': posts.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'files': []
          }
        }
      );
      messages.push(`Unlinked files from ${posts.length} post(s)`);
      modlogActions.push(7);
    }

    if (body.sticky !== undefined) {
      const threads = posts.filter((p: any) => !p.thread);
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': threads.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'sticky': body.sticky
          }
        }
      );
      messages.push(`${body.sticky ? 'Stickied' : 'Unstickied'} ${threads.length} thread(s)`);
      modlogActions.push(8);
    }

    if (body.lock) {
      const threads = posts.filter((p: any) => !p.thread);
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': threads.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'locked': true
          }
        }
      );
      messages.push(`Locked ${threads.length} thread(s)`);
      modlogActions.push(9);
    }

    if (body.bumplock) {
      const threads = posts.filter((p: any) => !p.thread);
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': threads.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'bumplocked': true
          }
        }
      );
      messages.push(`Bumplocked ${threads.length} thread(s)`);
      modlogActions.push(10);
    }

    if (body.cyclic) {
      const threads = posts.filter((p: any) => !p.thread);
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': threads.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            'cyclic': true
          }
        }
      );
      messages.push(`Made ${threads.length} thread(s) cyclic`);
      modlogActions.push(11);
    }

    if (body.report || body.global_report) {
      if (!body.report_reason) {
        return NextResponse.json(
          { error: 'Report reason required' },
          { status: 400 }
        );
      }

      const reportField = body.global_report ? 'globalreports' : 'reports';
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': posts.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$push': {
            [reportField]: {
              reason: body.report_reason,
              date: new Date(),
              ip: ip
            }
          }
        }
      );
      messages.push(`Reported ${posts.length} post(s)`);
    }

    if (body.dismiss || body.global_dismiss) {
      const reportField = body.global_dismiss ? 'globalreports' : 'reports';
      const postsDb = await getPostsCollection();
      await postsDb.updateMany(
        {
          '_id': {
            '$in': posts.map((p: any) => new ObjectId(p._id))
          }
        },
        {
          '$set': {
            [reportField]: []
          }
        }
      );
      messages.push(`Dismissed reports on ${posts.length} post(s)`);
      modlogActions.push(body.global_dismiss ? 13 : 12);
    }

    if (modlogActions.length > 0) {
      await Modlogs.insertOne({
        board: boardId,
        postLinks: posts.map((p: any) => ({
          postId: p.postId,
          thread: p.thread,
          board: p.board
        })),
        actions: modlogActions,
        public: true,
        date: new Date(),
        showUser: !body.hide_name,
        message: body.log_message || null,
        user: session.user,
        ip: ip,
        showLinks: !body.delete && !body.delete_ip_board && !body.delete_ip_global && !body.delete_ip_thread
      });
    }

    const referer = request.headers.get('referer');
    if (referer) {
      return NextResponse.redirect(referer);
    }
    return NextResponse.redirect(new URL(`/${boardId}/manage/recent.html`, request.url));

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
