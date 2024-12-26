import { useState, useEffect } from "react";
import "./ToDo.css";

function App() {
    // **STATE TANIMLAMALARI**
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState("");
    const [category, setCategory] = useState("Genel");
    const [deadline, setDeadline] = useState("");
    const [note, setNote] = useState("");
    const [priority, setPriority] = useState("Normal");
    const [filter, setFilter] = useState("all");
    const [categories, setCategories] = useState(["Genel", "İş", "Ev", "Sağlık"]);
    const [editingTask, setEditingTask] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [archive, setArchive] = useState([]);
    const [error, setError] = useState("");

    // **YEREL DEPOLAMA DESTEĞİ**
    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        setTasks(savedTasks);
        const savedArchive = JSON.parse(localStorage.getItem("archive")) || [];
        setArchive(savedArchive);
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("archive", JSON.stringify(archive));
    }, [tasks, archive]);

    // **YENİ GÖREV EKLEME**
    const addTask = () => {
        if (!taskInput.trim()) {
            setError("Görev adı boş bırakılamaz!");
            return;
        }
        setError("");

        const newTask = {
            id: Date.now(),
            text: taskInput,
            category,
            deadline,
            note,
            priority,
            completed: false,
        };
        setTasks([...tasks, newTask]);
        resetForm();
    };

    // **GÖREV DÜZENLEME**
    const editTask = (id) => {
        const taskToEdit = tasks.find((task) => task.id === id);
        setTaskInput(taskToEdit.text);
        setCategory(taskToEdit.category);
        setDeadline(taskToEdit.deadline);
        setNote(taskToEdit.note);
        setPriority(taskToEdit.priority);
        setEditingTask(id);
        setEditMode(true);
    };

    const saveEditedTask = () => {
        setTasks(
            tasks.map((task) =>
                task.id === editingTask
                    ? { ...task, text: taskInput, category, deadline, note, priority }
                    : task
            )
        );
        resetForm();
        setEditMode(false);
        setEditingTask(null);
    };

    // **GÖREVLERİ YÖNETME**
    const removeTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const toggleCompleted = (id) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const archiveTask = (id) => {
        const taskToArchive = tasks.find((task) => task.id === id);
        setArchive([...archive, taskToArchive]);
        removeTask(id);
    };

    const resetForm = () => {
        setTaskInput("");
        setCategory("Genel");
        setDeadline("");
        setNote("");
        setPriority("Normal");
    };

    // **FİLTRELEME VE SIRALAMA**
    const filteredTasks = tasks
        .filter((task) => {
            if (filter === "completed") return task.completed;
            if (filter === "pending") return !task.completed;
            return true;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    // **YENİ KATEGORİ EKLEME**
    const addCategory = (newCategory) => {
        if (newCategory.trim() && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    };

    return (
        <div className="container">
            <h1>Gelişmiş Yapılacaklar Listesi</h1>

            {/* **GİRİŞ ALANI** */}
            <div className="input-container">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Görev ekle..."
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Not ekle..."
                />
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Düşük">Düşük</option>
                    <option value="Normal">Normal</option>
                    <option value="Yüksek">Yüksek</option>
                </select>
                <button onClick={editMode ? saveEditedTask : addTask}>
                    {editMode ? "Kaydet" : "Ekle"}
                </button>
            </div>

            {/* **HATA MESAJI** */}
            {error && <p className="error-message">{error}</p>}

            {/* **FİLTRELER** */}
            <div className="filters">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">Tümü</option>
                    <option value="completed">Tamamlananlar</option>
                    <option value="pending">Bekleyenler</option>
                </select>
                <input
                    type="text"
                    placeholder="Yeni Kategori Ekle"
                    onKeyDown={(e) =>
                        e.key === "Enter" && addCategory(e.target.value.trim())
                    }
                />
            </div>

            {/* **İSTATİSTİKLER** */}
            <div className="summary">
                <p>Toplam Görev: {totalTasks}</p>
                <p>Tamamlanan: {completedTasks}</p>
                <p>Bekleyen: {totalTasks - completedTasks}</p>
            </div>

            {/* **GÖREV LİSTESİ** */}
            <ul className="task-list">
                {filteredTasks.map((task) => (
                    <li key={task.id} className={task.completed ? "completed" : ""}>
                        <div>
                            <strong>{task.text}</strong> - {task.category}
                            <br />
                            <small>Son Tarih: {task.deadline || "Belirtilmedi"}</small>
                            <br />
                            <small>Not: {task.note || "Yok"}</small>
                            <br />
                            <small>Öncelik: {task.priority}</small>
                        </div>
                        <div>
                            <button onClick={() => toggleCompleted(task.id)}>
                                {task.completed ? "Geri Al" : "Tamamla"}
                            </button>
                            <button onClick={() => editTask(task.id)}>Düzenle</button>
                            <button onClick={() => archiveTask(task.id)}>Arşivle</button>
                            <button onClick={() => removeTask(task.id)}>Sil</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
