export const menu = [
  { key: 'members', pages: [
    { key: 'directory', path: '/manage/members/list' },
    { key: 'registrations', path: '/manage/members/registrations' },
  ] },
  { key: 'sales', pages: [
    { key: 'orders', path: '/manage/sales/orders' },
    { key: 'revenue', path: '/manage/sales/summary' },
  ] },
  { key: 'site', pages: [
    { key: 'settings', path: '/manage/site/settings' },
    { key: 'notices', path: '/manage/site/notices' },
  ] },
] as const

export type MenuPage = (typeof menu)[number]['pages'][number]
export type PageKey = MenuPage['key']
export const managementPages: MenuPage[] = menu.flatMap<MenuPage>(group => group.pages)

export function managementPage(path: string) {
  const pathname = path.endsWith('/') ? path.slice(0, -1) : path
  return managementPages.find(page => page.path === pathname)
}
