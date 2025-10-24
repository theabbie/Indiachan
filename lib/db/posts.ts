import { getDb, ObjectId } from '../db';

export async function getCollection() {
  const database = await getDb();
  return database.collection('posts');
}

export const Posts = {
  async getThreadPage(board: string, thread: number) {
    const db = await getCollection();
    const threadsBefore = await db.aggregate([
      {
        '$match': {
          'thread': null,
          'board': board,
        }
      }, {
        '$project': {
          'sticky': 1,
          'bumped': 1,
          'postId': 1,
          'board': 1,
          'thread': 1
        }
      }, {
        '$sort': {
          'sticky': -1,
          'bumped': -1
        }
      }
    ]).toArray();
    const threadIndex = threadsBefore.findIndex((e: any) => e.postId === thread);
    const threadPage = Math.max(1, Math.ceil((threadIndex + 1) / 10));
    return threadPage;
  },

  async getRecent(board: string | string[] | null, page: number, limit: number = 10, getSensitive: boolean = false, sortSticky: boolean = true) {
    const db = await getCollection();
    const projection: any = {
      'salt': 0,
      'password': 0,
      'reports': 0,
      'globalreports': 0,
    };
    if (!getSensitive) {
      projection['ip'] = 0;
    }
    const threadsQuery: any = {
      'thread': null,
    };
    if (board) {
      if (Array.isArray(board)) {
        threadsQuery['board'] = {
          '$in': board
        };
      } else {
        threadsQuery['board'] = board;
      }
    }
    let threadsSort: any = {
      'bumped': -1,
    };
    if (sortSticky === true) {
      threadsSort = {
        'sticky': -1,
        'bumped': -1
      };
    }
    const threads = await db.find(threadsQuery, { projection })
      .sort(threadsSort)
      .skip(10 * (page - 1))
      .limit(limit)
      .toArray();

    await Promise.all(threads.map(async (thread: any) => {
      const previewRepliesLimit = thread.sticky ? 5 : 3;
      const replies = !previewRepliesLimit ? [] : await db.find({
        'thread': thread.postId,
        'board': thread.board
      }, { projection }).sort({
        'postId': -1
      }).limit(previewRepliesLimit).toArray();

      thread.replies = replies.reverse();

      if (thread.replyposts > previewRepliesLimit) {
        thread.previewbacklinks = [];
        if (previewRepliesLimit > 0) {
          const firstPreviewId = thread.replies[0].postId;
          const latestPreviewBacklink = thread.backlinks.find((bl: any) => bl.postId >= firstPreviewId);
          if (latestPreviewBacklink != null) {
            const latestPreviewIndex = thread.backlinks.map((bl: any) => bl.postId).indexOf(latestPreviewBacklink.postId);
            thread.previewbacklinks = thread.backlinks.slice(latestPreviewIndex);
          }
        }
        const numPreviewFiles = replies.reduce((acc: number, post: any) => acc + post.files.length, 0);
        thread.omittedfiles = thread.replyfiles - numPreviewFiles;
        thread.omittedposts = thread.replyposts - replies.length;
      }
    }));
    return threads;
  },

  async getThread(board: string, postId: number) {
    const db = await getCollection();
    const thread = await db.findOne({
      'board': board,
      'postId': postId,
      'thread': null
    }, {
      projection: {
        'salt': 0,
        'password': 0,
        'reports': 0,
        'globalreports': 0,
        'ip': 0
      }
    });
    if (!thread) {
      return null;
    }
    const replies = await db.find({
      'board': board,
      'thread': postId
    }, {
      projection: {
        'salt': 0,
        'password': 0,
        'reports': 0,
        'globalreports': 0,
        'ip': 0
      }
    }).sort({ 'postId': 1 }).toArray();
    thread.replies = replies;
    return thread;
  },

  async getThreadReplies(board: string, threadId: number, sincePostId: number = 0) {
    const db = await getCollection();
    const query: any = {
      'board': board,
      'thread': threadId
    };
    if (sincePostId > 0) {
      query['postId'] = { '$gt': sincePostId };
    }
    return db.find(query, {
      projection: {
        'salt': 0,
        'password': 0,
        'reports': 0,
        'globalreports': 0,
        'ip': 0
      }
    }).sort({ 'postId': 1 }).toArray();
  },

  async insertOne(post: any) {
    const db = await getCollection();
    return db.insertOne(post);
  },

  async deleteMany(query: any) {
    const db = await getCollection();
    return db.deleteMany(query);
  },

  async getThreadAggregates(ors: any[]) {
    const db = await getCollection();
    return db.aggregate([
      {
        '$match': {
          '$or': ors
        }
      }, {
        '$group': {
          '_id': {
            'thread': '$thread',
            'board': '$board'
          },
          'replyposts': {
            '$sum': 1
          },
          'replyfiles': {
            '$sum': {
              '$size': '$files'
            }
          }
        }
      }
    ]).toArray();
  },

  async updateThreadAggregates(board: string, threadId: number, replyposts: number, replyfiles: number, bumped: Date) {
    const db = await getCollection();
    return db.updateOne({
      'board': board,
      'postId': threadId,
      'thread': null
    }, {
      '$set': {
        'replyposts': replyposts,
        'replyfiles': replyfiles,
        'bumped': bumped
      }
    });
  },

  async getPosts(board: string, postIds: number[], getSensitive: boolean = false) {
    const db = await getCollection();
    const projection: any = {
      'salt': 0,
      'password': 0,
    };
    if (!getSensitive) {
      projection['ip'] = 0;
      projection['reports'] = 0;
      projection['globalreports'] = 0;
    }
    return db.find({
      'board': board,
      'postId': {
        '$in': postIds
      }
    }, { projection }).toArray();
  },

  async getPost(board: string, postId: number, getSensitive: boolean = false) {
    const db = await getCollection();
    const projection: any = {
      'salt': 0,
      'password': 0,
    };
    if (!getSensitive) {
      projection['ip'] = 0;
      projection['reports'] = 0;
      projection['globalreports'] = 0;
    }
    return db.findOne({
      'board': board,
      'postId': postId
    }, { projection });
  },

  async getPages(board: string) {
    const db = await getCollection();
    return db.countDocuments({
      'board': board,
      'thread': null
    });
  },

  get db() {
    return getCollection();
  }
};
