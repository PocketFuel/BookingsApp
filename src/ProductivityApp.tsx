import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Clock, Edit, Trash2, Plus, MoreHorizontal } from 'lucide-react';
import { supabase } from './supabaseClient';

interface Task {
  id: number;
  text: string;
  scheduled_time: string | null;
  state: 'Ready' | 'In Progress' | 'In Review' | 'Completed';
}

const ProductivityApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.log('error', error);
    else setTasks(data || []);
  }

  async function addTask() {
    if (newTask.trim() !== '') {
      const scheduledTime = newTaskDate && newTaskTime ? `${newTaskDate}T${newTaskTime}` : null;
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          text: newTask.trim(), 
          scheduled_time: scheduledTime,
          state: 'Ready'
        }])
        .single();

      if (error) console.log('error', error);
      else if (data) {
        setTasks([data, ...tasks]);
        setNewTask('');
        setNewTaskDate('');
        setNewTaskTime('');
      }
    }
  }

  async function removeTask(id: number) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .match({ id });

    if (error) console.log('error', error);
    else {
      setTasks(tasks.filter(task => task.id !== id));
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    }
  }

  async function updateTaskState(id: number, newState: Task['state']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ state: newState })
      .match({ id })
      .single();

    if (error) console.log('error', error);
    else if (data) {
      setTasks(tasks.map(task => task.id === id ? { ...task, state: newState } : task));
    }
  }

  const toggleTaskSelection = (id: number) => {
    setSelectedTasks(prevSelected => 
      prevSelected.includes(id) 
        ? prevSelected.filter(taskId => taskId !== id)
        : [...prevSelected, id]
    );
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', selectedTasks);

    if (error) console.log('error', error);
    else {
      setTasks(tasks.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = a.scheduled_time ? new Date(a.scheduled_time).getTime() : 8640000000000000;
    const timeB = b.scheduled_time ? new Date(b.scheduled_time).getTime() : 8640000000000000;
    return timeA - timeB;
  });

  return (
    <div style={{ 
      backgroundColor: '#191919', 
      color: '#e0e0e0', 
      padding: '24px',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffff' }}>Tasks</h1>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            style={{ 
              flex: '1', 
              padding: '10px 12px',
              backgroundColor: '#2c2c2c',
              color: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              outline: 'none',
              fontSize: '16px',
            }}
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            style={{ 
              padding: '10px 12px',
              backgroundColor: '#2c2c2c',
              color: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              outline: 'none',
              fontSize: '16px',
            }}
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            style={{ 
              padding: '10px 12px',
              backgroundColor: '#2c2c2c',
              color: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              outline: 'none',
              fontSize: '16px',
            }}
          />
          <button 
            onClick={addTask} 
            style={{ 
              padding: '10px 16px',
              backgroundColor: '#2c2c2c',
              color: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
            }}
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>
      {selectedTasks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <button onClick={handleBulkDelete} style={{ 
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Trash2 size={18} /> Delete Selected
          </button>
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {sortedTasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #2c2c2c',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckSquare
                size={20}
                color={selectedTasks.includes(task.id) ? '#3d9df3' : '#6b6b6b'}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleTaskSelection(task.id)}
              />
              <span style={{ fontSize: '16px' }}>{task.text}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {task.scheduled_time && (
                <span style={{ fontSize: '14px', color: '#6b6b6b' }}>
                  {new Date(task.scheduled_time).toLocaleString()}
                </span>
              )}
              <select
                value={task.state}
                onChange={(e) => updateTaskState(task.id, e.target.value as Task['state'])}
                style={{
                  padding: '6px',
                  backgroundColor: '#2c2c2c',
                  color: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <option value="Ready">Ready</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                onClick={() => removeTask(task.id)}
                style={{ 
                  padding: '6px',
                  backgroundColor: 'transparent',
                  color: '#6b6b6b',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductivityApp;