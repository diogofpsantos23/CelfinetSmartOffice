export const CandidatesData = [
  {
    id: "1",
    user: "Beltran",
    title: "Lorem ipsum dolor sit amet.",
    description: "Romona",
    status: "todo",
  },
  {
    id: "2",
    user: "Dave",
    title: "Fix Styling",
    description: "Romona",
    status: "todo",
  },
  {
    id: "3",
    user: "Roman",
    title: "Handle Door Specs",
    description: "Romona",
    status: "todo",
  },
  {
    id: "4",
    user: "Gawen",
    title: "morbi",
    description: "Kai",
    status: "done",
  },
  {
    id: "5",
    user: "Bondon",
    title: "proin",
    description: "Antoinette",
    status: "inprogress",
  },
];

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