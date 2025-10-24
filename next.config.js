/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  async rewrites() {
    return [
      { source: '/index.html', destination: '/' },
      { source: '/boards.html', destination: '/boards' },
      { source: '/create.html', destination: '/create' },
      { source: '/overboard.html', destination: '/overboard' },
      { source: '/account.html', destination: '/account' },
      { source: '/login.html', destination: '/login' },
      { source: '/register.html', destination: '/register' },
      { source: '/changepassword.html', destination: '/changepassword' },
      { source: '/faq.html', destination: '/faq' },
      { source: '/news.html', destination: '/news' },
      { source: '/rules.html', destination: '/rules' },
      { source: '/forms/logout', destination: '/api/auth/logout' },
      { source: '/forms/board/:board/post', destination: '/api/boards/:board/post' },
      { source: '/forms/board/:board/modpost', destination: '/api/boards/:board/post' },
      { source: '/forms/board/:board/actions', destination: '/api/boards/:board/actions' },
      { source: '/:board/index.html', destination: '/:board' },
      { source: '/:board/catalog.html', destination: '/:board/catalog' },
      { source: '/:board/thread/:id.html', destination: '/:board/thread/:id' },
      { source: '/:board/:page.html', destination: '/:board/:page' },
      { source: '/:board/manage/index.html', destination: '/:board/manage' },
      { source: '/:board/manage/recent.html', destination: '/:board/manage/recent' },
      { source: '/:board/manage/reports.html', destination: '/:board/manage/reports' },
      { source: '/:board/manage/bans.html', destination: '/:board/manage/bans' },
      { source: '/:board/manage/logs.html', destination: '/:board/manage/modlogs' },
      { source: '/:board/logs.html', destination: '/:board/manage/modlogs' },
      { source: '/:board/manage/settings.html', destination: '/:board/manage/settings' },
      { source: '/:board/manage/staff.html', destination: '/:board/manage/staff' },
      { source: '/:board/manage/custompages.html', destination: '/:board/manage/custompages' },
      { source: '/:board/manage/:page.html', destination: '/:board/manage/:page' },
      { source: '/globalmanage/index.html', destination: '/globalmanage/news' },
      { source: '/globalmanage/news.html', destination: '/globalmanage/news' },
      { source: '/globalmanage/:page.html', destination: '/globalmanage/:page' },
    ];
  },
}

module.exports = nextConfig
