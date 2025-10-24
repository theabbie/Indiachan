'use client';

import { useState } from 'react';
import type { Board } from '@/types/board';

interface PostFormProps {
  board: Board;
  thread?: { postId: number } | null;
  modview?: boolean;
  csrf?: string;
}

export default function PostForm({ board, thread = null, modview = false, csrf }: PostFormProps) {
  const isThread = thread != null;
  const subjectRequired = !isThread && board.settings.forceThreadSubject;
  const messageRequired = (!isThread && board.settings.forceThreadMessage) || (isThread && board.settings.forceReplyMessage);
  const fileRequired = (!isThread && board.settings.forceThreadFile) || (isThread && board.settings.forceReplyFile);
  const minLength = (isThread ? board.settings.minReplyMessageLength : board.settings.minThreadMessageLength) || 0;
  const maxLength = Math.min(
    (isThread ? board.settings.maxReplyMessageLength : board.settings.maxThreadMessageLength),
    10000
  ) || 10000;

  return (
    <section className="form-wrapper flex-center">
      <form
        className="form-post"
        id="postform"
        action={`/forms/board/${board._id}/${modview ? 'mod' : ''}post`}
        encType="multipart/form-data"
        method="POST"
        data-reset-on-submit="true"
      >
        {modview && csrf && <input type="hidden" name="_csrf" value={csrf} />}
        <input type="hidden" name="thread" value={isThread ? thread.postId : ''} />
        
        <section className="row jsonly">
          <div className="noselect" id="postform-dragHandle">
            <span className="fw text-center">{isThread ? 'New Reply' : 'New Thread'}</span>
            <a className="mr-0 close" href="#!"> [×]</a>
          </div>
        </section>

        {board.settings.forceAnon && !modview ? (
          <>
            {isThread && (
              <section className="row">
                <div className="label">Sage</div>
                <label className="postform-style ph-5">
                  <input type="checkbox" name="email" value="sage" />
                </label>
              </section>
            )}
            {!isThread && (
              <section className="row">
                <div className="label">
                  Subject
                  {subjectRequired && <span className="required"> *</span>}
                </div>
                <input type="text" name="subject" maxLength={100} required={subjectRequired} />
              </section>
            )}
          </>
        ) : (
          <>
            <section className="row">
              <div className="label">Name</div>
              <input
                type="text"
                name="name"
                placeholder={board.settings.defaultName}
                maxLength={50}
              />
            </section>
            {board.settings.sageOnlyEmail && !modview ? (
              isThread && (
                <section className="row">
                  <div className="label">Sage</div>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="email" value="sage" />
                  </label>
                </section>
              )
            ) : (
              <section className="row">
                <div className="label">Email</div>
                <input type="text" name="email" autoComplete="off" maxLength={75} />
              </section>
            )}
            {!isThread && (
              <section className="row">
                <div className="label">
                  Subject
                  {subjectRequired && <span className="required"> *</span>}
                </div>
                <input type="text" name="subject" maxLength={100} required={subjectRequired} />
              </section>
            )}
          </>
        )}

        <section className="row">
          <div className="label">
            <span>
              Message
              {messageRequired && <span className="required"> *</span>}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            rows={5}
            minLength={minLength}
            maxLength={maxLength}
            required={messageRequired}
          ></textarea>
        </section>

        {board.settings.maxFiles > 0 && Object.values(board.settings.allowedFileTypes).some(x => x === true) && (
          <>
            <section className="row">
              <div className="label">
                <span>
                  Files
                  {fileRequired && <span className="required"> *</span>}
                </span>
                {' '}
                {board.settings.maxFiles > 1 && <small>Max {board.settings.maxFiles} files</small>}
              </div>
              <span className="col">
                <label htmlFor="file" className="postform-style ph-5">
                  Choose File{board.settings.maxFiles > 1 ? 's' : ''}
                </label>
                <input
                  id="file"
                  type="file"
                  name="file"
                  multiple={board.settings.maxFiles > 1}
                  required={fileRequired}
                />
                <div
                  className="upload-list"
                  data-spoilers={board.settings.userPostSpoiler ? 'true' : 'false'}
                  data-strip-filenames="true"
                ></div>
              </span>
              {board.settings.userPostSpoiler && (
                <noscript>
                  <label className="noselect postform-style ph-5 ml-1 fh">
                    <input type="checkbox" name="spoiler_all" value="true" />
                    {' '}Spoiler
                  </label>
                </noscript>
              )}
            </section>
            {board.settings.enableTegaki && board.settings.allowedFileTypes.image && (
              <section className="row jsonly">
                <div className="label">Tegaki</div>
                <input className="dummy-link tegaki-button" type="button" value="Draw" />
                {board.settings.allowedFileTypes.other && (
                  <label className="noselect postform-style ph-5 ml-1 fh">
                    <input type="checkbox" name="tegakireplay" />
                    {' '}Replayable?
                  </label>
                )}
              </section>
            )}
          </>
        )}

        {(board.settings.userPostSpoiler || board.settings.userPostDelete || board.settings.userPostUnlink || modview) && (
          <section className="row">
            <div className="label">Password</div>
            <input
              type="password"
              name="postpassword"
              placeholder="Password to delete/spoiler/unlink later"
              maxLength={50}
              autoComplete="new-password"
            />
          </section>
        )}

        {(modview || board.settings.customFlags) && Object.keys(board.flags).length > 0 && (
          <section className="row">
            <div className="label">Flag</div>
            <select id="customflag" name="customflag">
              <option value="">{board.settings.geoFlags ? 'Geographic Flag' : 'None'}</option>
              {Object.entries(board.flags).map(([name, file]) => (
                <option key={name} value={name} data-src={`/flag/${board._id}/${file}`}>
                  {name}
                </option>
              ))}
            </select>
            <img className="jsonly" id="selected-flag" alt="" />
          </section>
        )}

        {((board.settings.captchaMode === 1 && !isThread) || board.settings.captchaMode === 2) && !modview && (
          <input type="hidden" name="captcha" id="captcha-token" />
        )}

        <input
          id="submitpost"
          type="submit"
          value={isThread ? 'New Reply' : 'New Thread'}
        />
      </form>
      <a className="collapse no-decoration post-button" href="#postform">
        [{isThread ? 'New Reply' : 'New Thread'}]
      </a>
    </section>
  );
}
