
import { Check } from "lucide-react"

const todos = [
  { id: 1, text: "Book return flight for Italian Vacation", completed: false },
  { id: 2, text: "Confirm dinner reservations in Paris", completed: false },
  { id: 3, text: "Update client passport information", completed: false },
  { id: 4, text: "Research activities in Caribbean", completed: false },
  { id: 5, text: "Send Japan itinerary to clients", completed: true },
]

export function TodoList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90">
          +
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-start gap-2">
            <div className={`mt-1 h-4 w-4 rounded-sm border ${todo.completed ? 'bg-primary border-primary' : 'border-input'} flex items-center justify-center`}>
              {todo.completed && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
