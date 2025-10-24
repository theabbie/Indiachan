document.addEventListener('DOMContentLoaded', function() {
  const livetext = document.getElementById('livetext');
  const livecolor = document.getElementById('livecolor');
  const updateButton = document.getElementById('updatepostsbutton');
  const threadStats = document.getElementById('threadstats');
  
  if (!livetext || !updateButton) return;
  
  const pathParts = window.location.pathname.split('/');
  const board = pathParts[1];
  const threadId = pathParts[3].replace('.html', '');
  
  let isPolling = false;
  let pollInterval = null;
  let lastPostId = 0;
  
  const allPosts = document.querySelectorAll('.post-container');
  allPosts.forEach(post => {
    const postId = parseInt(post.getAttribute('data-post-id'));
    if (postId > lastPostId) lastPostId = postId;
  });
  
  function setStatus(status, text) {
    livecolor.className = 'dot ' + status;
    const textNode = livetext.childNodes[2];
    if (textNode && textNode.nodeType === 3) {
      textNode.textContent = ' ' + text + ' ';
    }
  }
  
  async function fetchUpdates() {
    if (isPolling) return;
    isPolling = true;
    setStatus('loading', 'Updating...');
    
    try {
      const response = await fetch(`/api/boards/${board}/thread/${threadId}/updates?since=${lastPostId}`);
      const data = await response.json();
      
      if (data.success && data.replies && data.replies.length > 0) {
        const postsContainer = document.querySelector('form[name="postcontrols"]');
        if (!postsContainer) return;
        
        data.replies.forEach(reply => {
          if (reply.postId > lastPostId) {
            const postHtml = createPostHTML(reply);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = postHtml;
            const postElement = tempDiv.firstElementChild;
            
            const updateButton = document.getElementById('updatepostsbutton');
            if (updateButton && updateButton.parentElement) {
              updateButton.parentElement.parentElement.insertBefore(postElement, updateButton.parentElement);
            }
            
            lastPostId = reply.postId;
          }
        });
        
        if (threadStats) {
          const replyCount = threadStats.querySelector('span:first-child');
          if (replyCount) {
            const currentCount = parseInt(replyCount.textContent);
            replyCount.textContent = (currentCount + data.replies.length) + ' replies';
          }
        }
        
        setStatus('connected', 'Connected');
      } else {
        setStatus('connected', 'Connected');
      }
    } catch (error) {
      console.error('Live update error:', error);
      setStatus('disconnected', 'Error');
    } finally {
      isPolling = false;
    }
  }
  
  function createPostHTML(post) {
    const date = new Date(post.date).toLocaleString('en-US', { hourCycle: 'h23' });
    const filesHTML = post.files && post.files.length > 0 ? post.files.map(file => `
      <div class="post-file">
        <span class="post-file-info">
          <span>
            <a class="filename" href="${file.url}" download="${file.originalFilename}" target="_blank" rel="noopener noreferrer">
              ${file.originalFilename || file.filename}
            </a>
            ${file.size ? ` (${(file.size / 1024).toFixed(2)} KB)` : ''}
          </span>
        </span>
        <div class="post-file-src" data-type="image">
          <a target="_blank" href="${file.url}" rel="noopener noreferrer">
            <img class="file-thumb" src="${file.url}" alt="${file.originalFilename || file.filename}" style="max-width: 250px; max-height: 250px" loading="lazy" />
          </a>
        </div>
      </div>
    `).join('') : '';
    
    return `
      <div class="anchor" id="${post.postId}"></div>
      <div class="post-container" data-board="${post.board}" data-post-id="${post.postId}">
        <div class="post-info">
          <span>
            <label>
              <input class="post-check" type="checkbox" name="checkedposts" value="${post.postId}" />
              <span class="post-name">${post.name}</span>
              <time class="post-date reltime" datetime="${new Date(post.date).toISOString()}">${date}</time>
              <a class="no-decoration post-quote" href="#${post.postId}">>>>${post.postId}</a>
            </label>
          </span>
        </div>
        <div class="post-data">
          ${filesHTML ? `<div class="post-files">${filesHTML}</div>` : ''}
          ${post.message ? `<pre class="post-message">${post.message}</pre>` : ''}
        </div>
      </div>
    `;
  }
  
  updateButton.addEventListener('click', fetchUpdates);
  
  pollInterval = setInterval(fetchUpdates, 30000);
  
  setStatus('connected', 'Connected');
  
  window.addEventListener('beforeunload', function() {
    if (pollInterval) clearInterval(pollInterval);
  });
});
