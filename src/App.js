import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sortable from 'sortablejs';
import './App.css';

const API_URL = 'https://66b18f401ca8ad33d4f46a99.mockapi.io/tasks'; // Đổi URL này theo MockAPI của bạn

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const el = document.getElementById('task-list');
    if (el) {
      Sortable.create(el, {
        onEnd: (event) => handleSort(event),
      });
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    try {
      await axios.post(API_URL, { title: newTask, completed: false });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const handleUpdateTask = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { title: editTitle });
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleCompletion = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };
  
  const handleBulkAction = async (action) => {
    try {
      const promises = selectedTasks.map(taskId => {
        if (action === 'delete') {
          return axios.delete(`${API_URL}/${taskId}`);
        } else if (action === 'complete') {
          return axios.put(`${API_URL}/${taskId}`, { completed: true });
        }
        return null;
      }).filter(promise => promise !== null);
      await Promise.all(promises);
      setSelectedTasks([]);
      fetchTasks();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleSort = (event) => {
    // Code to handle sorting order and update on the server if needed
  };

  const handleSelectTask = (id) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Task Manager</h1>
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full shadow-sm"
          placeholder="New Task"
        />
        <button onClick={handleAddTask} className="bg-blue-600 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
          Add Task
        </button>
      </div>
      <div className="mb-6">
        <select onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 p-2 rounded-lg shadow-sm w-full">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <ul id="task-list" className="space-y-4">
        {tasks
          .filter(task => filter === 'all' || (filter === 'completed' && task.completed) || (filter === 'pending' && !task.completed))
          .map(task => (
            <li key={task.id} className="flex items-center p-4 bg-white shadow-md rounded-lg border border-gray-200">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleCompletion(task.id, task.completed)}
                className="mr-4"
              />
              <span className={`flex-1 text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</span>
              {editingTask && editingTask.id === task.id ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg"
                  />
                  <button onClick={() => handleUpdateTask(task.id)} className="bg-green-500 text-white p-2 rounded-lg shadow-md hover:bg-green-600 transition duration-200">
                    Update
                  </button>
                  <button onClick={() => setEditingTask(null)} className="bg-gray-500 text-white p-2 rounded-lg shadow-md hover:bg-gray-600 transition duration-200">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button onClick={() => handleEditTask(task)} className="bg-yellow-500 text-white p-2 rounded-lg shadow-md hover:bg-yellow-600 transition duration-200 mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white p-2 rounded-lg shadow-md hover:bg-red-600 transition duration-200">
                    Delete
                  </button>
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    className="ml-4"
                  />
                </div>
              )}
            </li>
          ))}
      </ul>
      <div className="mt-6 flex space-x-4">
        <button onClick={() => handleBulkAction('delete')} className="bg-red-500 text-white p-3 rounded-lg shadow-md hover:bg-red-600 transition duration-200">
          Delete Selected
        </button>
        <button onClick={() => handleBulkAction('complete')} className="bg-green-500 text-white p-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200">
          Mark as Complete
        </button>
      </div>
    </div>
  );
};

export default App;
