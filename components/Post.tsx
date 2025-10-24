import Link from 'next/link';
import type { Post as PostType } from '@/types/post';

interface PostProps {
  post: PostType;
  truncate?: boolean;
  manage?: boolean;
  globalmanage?: boolean;
  ban?: boolean;
  overboard?: boolean;
  modview?: boolean;
  viewRawIp?: boolean;
  upLevel?: boolean;
}

export default function Post({
  post,
  truncate = false,
  manage = false,
  globalmanage = false,
  ban = false,
  overboard = false,
  modview = false,
  viewRawIp = false,
  upLevel = false,
}: PostProps) {
  const postURL = `/${post.board}/${modview || manage || globalmanage ? 'manage/' : ''}thread/${post.thread || post.postId}.html`;
  const isOP = !post.thread && !ban;

  let truncatedMessage = post.message;
  if (post.message && truncate) {
    const splitPost = post.message.split('\n');
    const messageLines = splitPost.length;
    if (messageLines > 15) {
      truncatedMessage = splitPost.slice(0, 15).join('\n');
    } else if (post.message.length > 1500) {
      truncatedMessage = post.message.substring(0, 1500).replace(/<([\w]+)?([^>]*)?$/, '');
      const lastAnchorOpen = truncatedMessage.lastIndexOf('<a');
      const lastAnchorClose = truncatedMessage.lastIndexOf('</a>');
      if (lastAnchorOpen >= 0 && (lastAnchorClose === -1 || lastAnchorClose < lastAnchorOpen)) {
        truncatedMessage += '</a>';
      }
    }
  }

  return (
    <>
      <div className="anchor" id={String(post.postId)}></div>
      <div
        className={`post-container ${isOP ? 'op' : ''}`}
        data-board={post.board}
        data-post-id={post.postId}
        data-user-id={post.userId}
        data-name={post.name}
        data-tripcode={post.tripcode}
        data-subject={post.subject}
        data-email={post.email}
        data-flag={post.country?.code}
      >
        <div className="post-info">
          <span>
            <label>
              {!overboard && (
                <>
                  {globalmanage ? (
                    <input className="post-check" type="checkbox" name="globalcheckedposts" value={post._id} />
                  ) : !ban ? (
                    <input className="post-check" type="checkbox" name="checkedposts" value={post.postId} />
                  ) : null}
                  {' '}
                </>
              )}
              {manage && post.ip && (
                <Link href={`${upLevel ? '../' : ''}recent.html?ip=${encodeURIComponent(viewRawIp ? post.ip.raw! : post.ip.cloak!)}`} className="bold">
                  [{viewRawIp ? post.ip.raw : post.ip.cloak}]
                </Link>
              )}
              {modview && (
                <Link href={`${upLevel ? '../' : ''}recent.html?postid=${post.postId}`} className="bold">
                  [+]
                </Link>
              )}
              {globalmanage && (
                <>
                  <Link href={`/${post.board}/manage/index.html`} className="bold post-board">
                    /{post.board}/
                  </Link>
                  {' '}
                  {post.ip && (
                    <Link href={`?ip=${encodeURIComponent(viewRawIp ? post.ip.raw! : post.ip.cloak!)}`} className="bold">
                      [{viewRawIp ? post.ip.raw : post.ip.cloak}]
                    </Link>
                  )}
                </>
              )}
              {' '}
              {isOP && (
                <>
                  {post.sticky && <img className="icon" src="/img/sticky.png" height="16" width="16" alt="Sticky" />}
                  {post.locked && <img className="icon" src="/img/locked.png" height="16" width="16" alt="Locked" />}
                  {post.cyclic && <img className="icon" src="/img/cyclic.png" height="16" width="16" alt="Cyclic" />}
                  {post.saged && <img className="icon" src="/img/saged.png" height="16" width="16" alt="Saged" />}
                </>
              )}
              {post.subject && (
                <>
                  <span className="post-subject">{post.subject}</span>
                  {' '}
                </>
              )}
              {post.email ? (
                <a className="post-name" href={`mailto:${post.email}`}>{post.name}</a>
              ) : (
                <span className="post-name">{post.name}</span>
              )}
              {' '}
            </label>
            {post.country && post.country.code && (
              <img
                className="flag"
                src={`/flag/${post.country.code.toLowerCase()}.png`}
                height="11"
                width="16"
                alt={post.country.name}
                title={post.country.name}
              />
            )}
            {post.tripcode && (
              <>
                <span className="post-tripcode">{post.tripcode}</span>
                {' '}
              </>
            )}
            {post.capcode && (
              <>
                <span className="post-capcode">{post.capcode}</span>
                {' '}
              </>
            )}
            <time className="post-date reltime" dateTime={new Date(post.date).toISOString()}>
              {new Date(post.date).toLocaleString('en-US', { hourCycle: 'h23' })}
            </time>
            {' '}
            {post.userId && (
              <>
                <span className="user-id" style={{ backgroundColor: `#${post.userId}` }}>
                  {post.userId}
                </span>
                {' '}
              </>
            )}
          </span>
          <span className="post-links">
            <a className="noselect no-decoration" href={`${postURL}#${post.postId}`}>No.</a>
            <span className="post-quoters">
              <a className="no-decoration" href={`${postURL}#postform`}>{post.postId}</a>
            </span>
            {' '}
            {isOP && (truncate || manage || globalmanage) && (
              <>
                {' '}
                <span className="noselect">
                  <Link href={postURL}>[Open]</Link>
                </span>
              </>
            )}
            <select className="jsonly postmenu">
              <option value="single">Hide</option>
              {post.userId && <option value="fid">Filter ID</option>}
              {post.name && <option value="fname">Filter Name</option>}
              {post.tripcode && <option value="ftrip">Filter Tripcode</option>}
              {post.subject && <option value="fsub">Filter Subject</option>}
              {post.country?.code && <option value="fflag">Filter Flag</option>}
              {!overboard && !ban && <option value="moderate">Moderate</option>}
              {!ban && (modview || manage || globalmanage) && <option value="edit">Edit</option>}
              {isOP && (
                <>
                  <option value="watch">Watch</option>
                  <option value="playlist">Playlist</option>
                </>
              )}
            </select>
          </span>
        </div>
        <div className="post-data">
          {post.files.length > 0 && (
            <div className={`post-files ${post.files.length > 1 ? 'fn' : ''}`}>
              {post.files.map((file: any, fileindex: number) => {
                const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : '';
                const type = file.mimetype ? file.mimetype.split('/')[0] : 'image';
                return (
                  <div key={fileindex} className="post-file">
                    <span className="post-file-info">
                      <span>
                        <a
                          className="filename"
                          href={file.url}
                          download={file.originalFilename}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.originalFilename || file.filename}
                        </a>
                        {' '}
                        {fileSize && `(${fileSize})`}
                      </span>
                    </span>
                    <div className="post-file-src" data-type={type}>
                      <a target="_blank" href={file.url} rel="noopener noreferrer">
                        {post.spoiler ? (
                          <div className="spoilerimg file-thumb"></div>
                        ) : (
                          <img
                            className="file-thumb"
                            src={file.url}
                            alt={file.originalFilename || file.filename}
                            style={{ maxWidth: '250px', maxHeight: '250px' }}
                            loading="lazy"
                          />
                        )}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {post.message ? (
            <pre className="post-message" dangerouslySetInnerHTML={{ __html: truncatedMessage || '' }}></pre>
          ) : post.files.length === 0 ? (
            <p>No message or files.</p>
          ) : null}
          {post.edited && (
            <small className="cb mv-5 ml-5 edited">
              Last edited <time className="reltime" dateTime={new Date(post.edited.date).toISOString()}>
                {new Date(post.edited.date).toLocaleString('en-US', { hourCycle: 'h23' })}
              </time> by {post.edited.username || 'Hidden User'}
            </small>
          )}
          {post.banmessage && (
            <div className="ban-message">{post.banmessage}</div>
          )}
          {truncatedMessage !== post.message && (
            <div className="cb mt-5 ml-5">
              Message too long. <Link href={`${postURL}#${post.postId}`} className="viewfulltext">View the full text</Link>
            </div>
          )}
          {(post.omittedposts || post.omittedfiles) && (
            <div className="cb mt-5 ml-5">
              <img
                className="jsonly dummy-link expand-omitted"
                height="12"
                width="12"
                data-shown={post.replies?.length}
                data-board={post.board}
                data-thread={post.postId}
                src="/file/plus.png"
                alt="+"
              />
              <span>
                {post.omittedposts} {post.omittedposts === 1 ? 'reply' : 'replies'}
                {post.omittedfiles ? ` and ${post.omittedfiles} ${post.omittedfiles === 1 ? 'file' : 'files'}` : ''} omitted.
              </span>
              {' '}
              <Link href={postURL}>View the full thread</Link>
            </div>
          )}
          {post.previewbacklinks && post.previewbacklinks.length > 0 ? (
            <div className="replies mt-5 ml-5">
              Replies: {post.previewbacklinks.map((backlink, i) => (
                <span key={i}>
                  <a className="quote" href={`${postURL}#${backlink.postId}`}>&gt;&gt;{backlink.postId}</a>
                  {' '}
                </span>
              ))}
              {post.backlinks && post.previewbacklinks.length < post.backlinks.length && (
                <>
                  + <Link href={`${postURL}#${post.postId}`}>{post.backlinks.length - post.previewbacklinks.length} earlier</Link>
                  {' '}
                </>
              )}
            </div>
          ) : post.backlinks && post.backlinks.length > 0 ? (
            <div className="replies mt-5 ml-5">
              Replies: {post.backlinks.map((backlink, i) => (
                <span key={i}>
                  <a className="quote" href={`${postURL}#${backlink.postId}`}>&gt;&gt;{backlink.postId}</a>
                  {' '}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
