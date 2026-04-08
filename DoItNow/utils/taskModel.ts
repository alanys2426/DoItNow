
import { type ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { boardColumns, type BoardColumbId} from '@/constants/theme';
import { parseYmdToDate } from '@/component/ui/due-date-field';

export type TaskLabel = 'bug' | 'feature' | 'design';

export type LabelFilterSelection = 'all' | TaskLabel[]

export type PriorityFilterSelection = 'all' | (1 | 2 | 3 | 4 | 5)[];

export const TASK_LABELS: TaskLabel[] = ['bug', 'feature', 'design']

export const TASK_LABEL_TITLE: Record<TaskLabel, string> = {
    bug: 'Bug',
    feature: 'Feature',
    design: 'Design',
};

// Icon names mapped to each label
export const TASK_LABEL_ICONS = {
    bug: 'bug-report',
    feature: 'lightbulb-outline',
    design: 'brush',
} as const satisfies Record<TaskLabel, ComponentProps<typeof MaterialIcons>['name']>
// ^ satisfies --> checks that value matches a type
// ComponentProps --> TS helper that gives you the type of a React component's props
// "ComponentProps<typeof MaterialIcons>['name']"
//  + Gives the type of the 'name' prop from the MaterialIcons component
//      - EX: name="bug-report"


export type Task = {
    id: string;
    title: string;
    description: string;
    priority: number;
    dueDate: string;
    labels: TaskLabel[];
    status: BoardColumbId;
    orderInColumn: number;
}

// Regex to validate YYYY-MM-DD format
const YMD_RE = /^\d{4}-\d{2}-d{2}$/

// Converts "YYYY-MM-DD" --> readable format like "Apr 10"
export function formatDueCardChip(ymd: string): string {
    const trimmed = ymd.trim();

    // if format is invalid --> return empty string
    if (!YMD_RE.test(trimmed)) return '';

    const date = parseYmdToDate(trimmed);

    // convert Date --> "Apr 10"
    // toLocaleDateString --> formats a Date into a nice-looking date string
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

// Sample data
const initialTasks: Task[] = [
    {
        id: 't1',
        title: 'Outline Q2 product themes',
        description: "List focus areas so the team can align in Monday's planning session.",
        priority: 3,
        dueDate: '2026-04-10',
        labels: ['feature', 'design'],
        status: 'todo',
        orderInColumn: 0,
    },
    {
        id: 't2',
        title: 'Polish onboarding copy',
        description: "Tighten empty states, success messages, and the first-run checklist.",
        priority: 4,
        dueDate: '2026-04-08',
        labels: ['design'],
        status: 'inprogress',
        orderInColumn: 0,
    },
    {
        id: 't3',
        title: 'Review mobile nav contrast',
        description: "Spot-check bottom nav and filters on small screens in light and dark mode.",
        priority: 4,
        dueDate: '2026-04-06',
        labels: ['bug'],
        status: 'review',
        orderInColumn: 0,
    },
    {
        id: 't4',
        title: 'Ship sprint announcement',
        description: "Email and in-app banner with release notes for the last deploy",
        priority: 5,
        dueDate: '2026-04-03',
        labels: ['feature'],
        status: 'done',
        orderInColumn: 0,
    },
    
]

// Forces priority into valid range (1-5)
export function clampPriority(p: number): number {
    if (Number.isNaN(p) || p < 1) return 1;
    if (p > 5) return 5;
    return Math.round(p);
}

// Convert user input string into priority number
export function parseTaskPriorityInput(raw: string): number | null {
    const str = raw.trim();

    if (str === '') return null;
    if (str === '!') return 5;

    const num = Number.parseInt(str, 10);

    if (Number.isNaN(num) || num < 1 || num > 5) return null;

    return num;
}

// Converts YYYY-MM-DD into sortable number (YYYYMMDD)
function dueDateSortKey(ymd: string): number {
    const str = ymd.trim();

    // invalid date --> push to the bottom
    if (!YMD_RE.test(str)) return Number.POSITIVE_INFINITY;

    // map() --> takes an array, runs a function on every item, and returns a new array
    // with the results
    const [y, m, d] = str.split('-').map(Number);

    return y * 10000 + m * 100 + d;
}

// Compare tasks by due date (earliest first)
function compareDueDateAsc(a: Task, b: Task): number {
    return dueDateSortKey(a.dueDate) - dueDateSortKey(b.dueDate);
}

// Order first by priority, date, orderInColumn, and then alphabetically
export function sortTasksInColumn(a: Task, b: Task): number {
    const difPr = b.priority - a.priority;
    if (difPr !== 0) return difPr;

    const difDate = compareDueDateAsc(a, b);
    if (difDate !== 0) return difDate;

    const difOrd = a.orderInColumn - b.orderInColumn;
    if (difOrd !== 0) return difOrd;

    // a.localeCompare(b) --> tells you when string a comes before, after, or is equal
    // to string b in alphabetical order
    return a.id.localeCompare(b.id);
}

// Find highest orderInColumn in same priority group
export function maxOrderInPriorityTier(
    tasks: Task[],
    columnId: BoardColumnId,
    priority: number,
    excludeTaskId?: string,
): number {

    // campPriority --> Forces a value to stay within a valid range
    const p = clampPriority(priority);
    return tasks
        // filter() --> Takes an array and returns a new array containing only the
        // items that pass a test you define
        .filter((t) =>
            t.status === columnId && clampPriority(t.priority) === p && t.id !== excludeTaskId
        )

        // reduce() --> Takes an entire array and reduces it to a single value
        .reduce((max, t) => Math.max(max, t.orderInColumn), -1);

}

export function normalizeTaskOrders(tasks: Task[]): Task[] {
    const seen = new Set<string>();
    const out: Task[] = []

    // Loop through each column
    for (const col of boardColumns) {

        // Get tasks in this column
        const inCol = tasks.filter((t) => t.status === col.id);

        // byPri-ority
        const byPri = new Map<number, Task[]>();

        // Group tasks by priority
        for (const t of inCol) {
            const p = clampPriority(t.priority)

            // If no priority was set, set to empty
            if(!byPri.has(p)) byPri.set(p, []);

            // '!' promises that it's not undefined
            // Add task to that prioirity tear
            byPri.get(p)!.push(t);

        }
        // keys() --> returns an iterator of all keys in the Map
        // Sort priorities (high --> low)
        const pris = [...byPri.keys()].sort((a, b) => b - a);

        // Process each priority group
        for (const p of pris) {

            // Sort tasks inside priority group
            const g = byPri.get(p)!.sort((a, b) => {
                // Earlier due date first 
                const byDue = compareDueDateAsc(a, b);
                if (byDue !== 0) return byDue;

                return a.orderInColumn - b.orderInColumn || a.id.localeCompare(b.id);
            });

            // Assign new clean order indexes (0, 1, 2, ...)
            g.forEach((t, i) => {
                seen.add(t.id);
                out.push({ ...t, status: col.id, priority: p, orderInColumn: i});
            });
        }
    }

    // Add any tasks we didn't process
    for (const t of tasks) {
        if (!seen.has(t.id)) out.push(t);
    }

    return out;
}

// Get display name for a label
export function taskLabelDisplay(label: TaskLabel): string {
    return TASK_LABEL_TITLE[label];
}

// Get icon name for a label
export function taskLabelIcon(label: TaskLabel): ComponentProps<typeof MaterialIcons>['name'] {
    return TASK_LABEL_ICONS[label];
}

// Keep labels unique and in predefined order
// 'readonly' property --> You can read the value but cannot change it after it's set
export function sortLabelsUnique(labels: readonly TaskLabel[]): TaskLabel[] {
    return TASK_LABELS.filter((l) => labels.includes(l));
}

export type TaskLayout = { top: number, height: number};

// Calculate where to insert a dragged task based on Y position
export function computeInsertIndexFromY(
    relativeY: number,
    orderedColumnTasks: Task[],
    layouts: Record<string, TaskLayout>,
    movingId: string,
    sameColumn: boolean
): number {
    // remove moving task if it's in the same column
    const others = sameColumn
        ? orderedColumnTasks.filter((t) => t.id !== movingId)
        : [...orderedColumnTasks]

    let insert = 0;

    for (const t of others) {
        const L = layouts[t.id];

        // If layout missing, just move forwards
        if (!L) {
            insert++;
            continue;
        }

        // This is the midpoint of task
        const mid = L.top + L.height / 2;

        // If cursor is above midpoint --> stop here
        if (relativeY < mid) break;

        insert++;
    }

    return insert;
}

// Movse or reorder a task in a column
export function applyMoveOrReorder(
    prev: Task[],
    taskId: string,
    targetColumnId: BoardColumnId,
    insertIndex: number
): Task[] {
    
    // Find the task being moved
    const moving = prev.find((t) => t.id === taskId);
    if (!moving) return prev;

    // Remove it from list
    const without = prev.filter((t) => t.id !== taskId);

    // Get tasks in targe column and sort them
    const inTarget = without
        .filter((t) => t.status === targetColumnId)
        .sort(sortTasksInColumn);

    // Make sure index is valid
    const clamped = Math.max(0, Math.min(insertIndex, inTarget.length));
    
    // Insert task into new position
    const reorderd = [
        ...inTarget.slice(0, clamped),
        {...moving, status: targetColumnId },
        ...inTarget.slice(clamped)
    ];

    // keep other tasks unchanged
    const rest = without.filter((t) => t.status !== targetColumnId);

    // Normalize everything after move
    return normalizeTaskOrders([...rest, ...reorderd])
}


// Initial list of tasks
export const seedTasks = normalizeTaskOrders(initialTasks)
