
import AsyncStorage from '@react-native-async-storage/async-storage'

// Key used to store tasks in the device's local storage
const STORAGE_KEY = '@doitnow/tasks';

const VALID_STATUSES = new Set(['todo', 'inprogress', 'review', 'done'])
const VALID_LABELS = new Set(['bug', 'feature', 'design'])

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: number;
    dueDate: string;
    labels: Array<'bug' | 'feature' | 'design'>;
    status: 'todo' | 'inprogress' | 'review' | 'done';
    orderInColumn: number;
};

// Function to check if unknown data is a valid task object
function isTask(x: unknown): x is Task {

    // Must exist and be an object
    if (!x || typeof x !== 'object') return false;
     
    // Record<> --> TS helper type for objects with keys and values
    //  + Record<string, unknown>
    //      - An object where keys are strings and values can be anything
    const r = x as Record<string, unknown>

    if (typeof r.id !== 'string' || !r.id) return false;
    if (typeof r.title !== 'string') return false;
    if (typeof r.description !== 'string') return false;

    // Number.isFinite(value) --> returns true if it's a number
    //  + Not infinity or -infinity
    if (typeof r.priority !== 'number' || !Number.isFinite(r.priority)) return false;
    if (typeof r.dueDate !== 'string') return false;

    if (!Array.isArray(r.labels)) return false;
    for (const lb of r.labels) {
        if (typeof lb !== 'string' || !VALID_LABELS.has(lb)) return false;
    }

    if (typeof r.status !== 'string' || !VALID_STATUSES.has(r.status)) return false;
    if (typeof r.orderInColumn !== 'number' || !Number.isFinite(r.orderInColumn)) return false;

    return true;
}

// Load tasks from device storage
// Promise<> --> TS type for something that will give a value in the future
//  + In other words: A Promise is a placeholder for a value that arrives later
export async function loadTasks(): Promise<Task[] | null> {
    try {

        // Get raw string from AsyncStorage
        const str = await AsyncStorage.getItem(STORAGE_KEY);

        if (!str) return null;

        // JSON.parse() --> turns a string into a JS value
        const parsed = JSON.parse(str) as unknown;

        // Must be an array of tasks
        if (!Array.isArray(parsed)) return null;

        const out: Task[] = [];

        //Validate each task before using it
        for (const row of parsed) {
            if (isTask(row)) out.push(row);
        }

        return out;
    } catch {
        return null;
    }
}

// Save tasks to device storage
export async function saveTasks(tasks: Task[]): Promise<void> {
    try {
        // JSON.stringify --> Turns a JavaScript value into a string
        //  + object --> string (JSON format)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
        // Silent fail
    }
}

// This function clears all saved tasks from device storage
export async function clearTasks(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
        // Silent fail
    }
}
