interface HabitProps {
  completed: number;
}

export function Habit(props: HabitProps) {
  const { completed } = props;
  return <div className="bg-zinc-900 w-10">habit {completed}</div>;
}
