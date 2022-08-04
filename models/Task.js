import { mongoose } from 'mongoose';

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    deliveryDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    priority: {
        type: String,
        enum: ["Baja", "Media", "Alta"],
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    completed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    }
}, {
    timestamps: true
});

const Task = mongoose.model("Task", taskSchema);
export default Task;