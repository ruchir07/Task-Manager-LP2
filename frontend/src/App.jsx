import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, CheckCircle2, Circle, Clock, ClipboardList } from 'lucide-react';

// The API URL is loaded from the .env file. 
// For production on EC2, simply change the URL in the frontend/.env file!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await axios.post(API_URL, {
        title,
        description,
        status: 'pending'
      });
      setTasks([response.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { status });
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Nexus Tasks</h1>
        <p className="app-subtitle">Organize your workflow. Boost your productivity.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              className="form-control"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} />
            Create Task
          </button>
        </form>

        <div className="filters">
          {['all', 'pending', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} className="empty-icon" />
              <h3>No tasks found</h3>
              <p>Create a task above to get started!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className="task-content">
                  <div className="task-header">
                    <span className={`task-status status-${task.status}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className="btn btn-icon btn-delete"
                    onClick={() => deleteTask(task._id)}
                    title="Delete Task"
                  >
                    <Trash2 size={20} />
                  </button>
                  {task.status === 'completed' ? (
                    <button
                      className="btn btn-icon"
                      style={{ color: 'var(--success)' }}
                      onClick={() => updateStatus(task._id, 'pending')}
                      title="Mark as Pending"
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-icon"
                      onClick={() => updateStatus(task._id, 'completed')}
                      title="Mark as Completed"
                    >
                      <Circle size={24} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

export default App;
