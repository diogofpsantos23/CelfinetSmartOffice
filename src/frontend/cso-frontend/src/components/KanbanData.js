export const buildColumns = (candidates) => ({
  todo: {
    title: 'To Do',
    items: candidates.filter((item) => item.status === 'todo'),
  },
  inprogress: {
    title: 'In Progress',
    items: candidates.filter((item) => item.status === 'inprogress'),
  },
  done: {
    title: 'Done',
    items: candidates.filter((item) => item.status === 'done'),
  },
});