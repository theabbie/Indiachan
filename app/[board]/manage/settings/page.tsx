import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';

export default async function BoardSettingsPage({ params }: { params: Promise<{ board: string }> }) {
  const { board: boardId } = await params;
  const username = await getSessionUser();
  
  if (!username) {
    redirect('/login.html');
  }

  const board = await Boards.findOne(boardId);
  
  if (!board) {
    notFound();
  }

  const account = await Accounts.findOne(username);
  
  if (!account) {
    redirect('/login.html');
  }

  const isOwner = account.ownedBoards?.includes(boardId);

  if (!isOwner) {
    return (
      <>
        <Navbar board={board} modview={true} />
        <main>
          <div className="container">
            <BoardHeader board={board} subtitle="Settings" />
            <hr />
            <p>Only board owners can access settings.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const themes = ['yotsuba', 'yotsuba-b', 'tomorrow', 'tomorrow2', 'gruvbox-dark', 'miku', 'lain'];
  const codeThemes = ['ir-black', 'monokai', 'github', 'tomorrow', 'solarized-dark', 'solarized-light'];

  return (
    <>
      <Navbar board={board} modview={true} managePage="settings.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Settings" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>

          {isOwner && (
            <>
              <hr />
              <h4 className="no-m-p">Transfer ownership:</h4>
              <div className="form-wrapper flexleft mt-10">
                <form className="form-post" action={`/api/boards/${boardId}/transfer`} method="POST">
                  <div className="row">
                    <div className="label">New owner username:</div>
                    <input type="text" name="username" placeholder={board.owner} required />
                  </div>
                  <input type="submit" value="Submit" />
                </form>
              </div>

              <hr />
              <h4 className="no-m-p">Delete board:</h4>
              <div className="form-wrapper flexleft mt-10">
                <form className="form-post" action={`/api/boards/${boardId}/delete`} method="POST">
                  <div className="row">
                    <div className="label">Board URI:</div>
                    <input type="text" name="uri" required />
                  </div>
                  <div className="row">
                    <div className="label">I'm sure</div>
                    <label className="postform-style ph-5">
                      <input type="checkbox" name="confirm" value="true" required />
                    </label>
                  </div>
                  <input type="submit" value="Submit" />
                </form>
              </div>
            </>
          )}

          <hr />
          <div className="form-wrapper flexleft mt-10">
            <form className="form-post" action={`/api/boards/${boardId}/settings`} method="POST">
              <div className="mv-10">
                <div className="sm" id="tab-1">
                  <div className="sm" id="tab-2">
                    <div className="sm" id="tab-3">
                      <div className="sm" id="tab-4">
                        <div className="sm" id="tab-5">
                          <div className="tabbed-area">
                            <ul className="tabs group">
                              <li><a href="#tab-1">General</a></li>
                              <li><a href="#tab-2">Posting</a></li>
                              <li><a href="#tab-3">Files</a></li>
                              <li><a href="#tab-4">Limits</a></li>
                              <li><a href="#tab-5">Antispam</a></li>
                            </ul>

                            <div className="box-wrap">
                              <div className="tab tab-1">
                                <div className="col">
                                  <div className="row">
                                    <div className="label">Board name</div>
                                    <input type="text" name="name" defaultValue={board.settings.name} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Board Description</div>
                                    <input type="text" name="description" defaultValue={board.settings.description} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Theme</div>
                                    <select name="theme" defaultValue={board.settings.theme}>
                                      {themes.map(theme => (
                                        <option key={theme} value={theme}>{theme}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="row">
                                    <div className="label">Code Theme</div>
                                    <select name="code_theme" defaultValue={board.settings.codeTheme}>
                                      {codeThemes.map(theme => (
                                        <option key={theme} value={theme}>{theme}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="row">
                                    <div className="label">IDs</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="ids" value="true" defaultChecked={board.settings.ids} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Geo Flags</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="geo_flags" value="true" defaultChecked={board.settings.geoFlags} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Custom Flags</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="custom_flags" value="true" defaultChecked={board.settings.customFlags} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Reverse Image Search Links</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="reverse_image_search_links" value="true" defaultChecked={board.settings.reverseImageSearchLinks} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Enable Tegaki</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="enable_tegaki" value="true" defaultChecked={board.settings.enableTegaki} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Enable Web3</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="enable_web3" value="true" defaultChecked={board.settings.enableWeb3} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Unlist locally</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="unlisted_local" value="true" defaultChecked={board.settings.unlistedLocal} />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="tab tab-2">
                                <div className="col">
                                  <div className="row">
                                    <div className="label">Anon Name</div>
                                    <input type="text" name="default_name" defaultValue={board.settings.defaultName} />
                                  </div>
                                  <div className="row">
                                    <div className="label">User Post Deletion</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="user_post_delete" value="true" defaultChecked={board.settings.userPostDelete} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">User Post Spoiler</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="user_post_spoiler" value="true" defaultChecked={board.settings.userPostSpoiler} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">User Post Unlink</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="user_post_unlink" value="true" defaultChecked={board.settings.userPostUnlink} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Anon</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_anon" value="true" defaultChecked={board.settings.forceAnon} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Sage Only Email</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="sage_only_email" value="true" defaultChecked={board.settings.sageOnlyEmail} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Thread Subject</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_thread_subject" value="true" defaultChecked={board.settings.forceThreadSubject} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Thread Message</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_thread_message" value="true" defaultChecked={board.settings.forceThreadMessage} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Thread File</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_thread_file" value="true" defaultChecked={board.settings.forceThreadFile} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Reply Message</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_reply_message" value="true" defaultChecked={board.settings.forceReplyMessage} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Force Reply File</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="force_reply_file" value="true" defaultChecked={board.settings.forceReplyFile} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Min Thread Message Length</div>
                                    <input type="number" name="min_thread_message_length" defaultValue={board.settings.minThreadMessageLength} min={0} max={10000} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Min Reply Message Length</div>
                                    <input type="number" name="min_reply_message_length" defaultValue={board.settings.minReplyMessageLength} min={0} max={10000} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Max Thread Message Length</div>
                                    <input type="number" name="max_thread_message_length" defaultValue={board.settings.maxThreadMessageLength} min={0} max={10000} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Max Reply Message Length</div>
                                    <input type="number" name="max_reply_message_length" defaultValue={board.settings.maxReplyMessageLength} min={0} max={10000} />
                                  </div>
                                </div>
                              </div>

                              <div className="tab tab-3">
                                <div className="col">
                                  <div className="row">
                                    <div className="label">Max Files</div>
                                    <input type="number" name="max_files" defaultValue={board.settings.maxFiles} max={5} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Allow Image Files</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="allow_image_files" value="true" defaultChecked={board.settings.allowedFileTypes?.image} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Allow Video Files</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="allow_video_files" value="true" defaultChecked={board.settings.allowedFileTypes?.video} />
                                    </label>
                                  </div>
                                  <div className="row">
                                    <div className="label">Allow Audio Files</div>
                                    <label className="postform-style ph-5">
                                      <input type="checkbox" name="allow_audio_files" value="true" defaultChecked={board.settings.allowedFileTypes?.audio} />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="tab tab-4">
                                <div className="col">
                                  <div className="row">
                                    <div className="label">Reply Limit</div>
                                    <input type="number" name="reply_limit" defaultValue={board.settings.replyLimit} min={10} max={1000} />
                                  </div>
                                  <div className="row">
                                    <div className="label">Thread Limit</div>
                                    <input type="number" name="thread_limit" defaultValue={board.settings.threadLimit || 200} min={10} max={500} />
                                  </div>
                                </div>
                              </div>

                              <div className="tab tab-5">
                                <div className="col">
                                  <div className="row">
                                    <div className="label">Captcha Mode</div>
                                    <select name="captcha_mode" defaultValue={board.settings.captchaMode}>
                                      <option value="0">Disabled</option>
                                      <option value="1">Threads only</option>
                                      <option value="2">All posts</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input type="submit" value="Save Settings" />
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
