
import React, { useState } from 'react';
import { TodoItem } from '../types';
import { TrashIcon, PlusIcon } from './icons';

interface TodoListProps {
  todos: TodoItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onToggle, onDelete }) => {
  const [newTodoText, setNewTodoText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newTodoText);
    setNewTodoText('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">TODOリスト</h2>
      <form onSubmit={handleAdd} className="flex mb-4">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="新しいタスクを追加..."
          className="flex-grow bg-slate-700 text-white rounded-l-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
      <div className="space-y-2">
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center p-3 rounded-md transition-all ${
              todo.completed ? 'bg-slate-700/50 text-gray-500' : 'bg-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="w-5 h-5 rounded text-blue-500 bg-slate-600 border-slate-500 focus:ring-blue-500"
            />
            <span className={`flex-grow mx-3 ${todo.completed ? 'line-through' : ''}`}>{todo.text}</span>
            <button onClick={() => onDelete(todo.id)} className="text-gray-400 hover:text-red-400">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        {todos.length === 0 && <p className="text-center text-gray-500 mt-6">タスクはありません。</p>}
      </div>
    </div>
  );
};

export default TodoList;
