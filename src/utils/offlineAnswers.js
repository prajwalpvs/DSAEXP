const C = '```'; // backtick helper for code blocks in template literals

const OFFLINE_DB = [
  {
    keywords: ['two sum', 'twosum', '2sum'],
    topic: 'Two Sum',
    answer: `## Two Sum

Find two numbers in an array that add up to a target, and return their indices. The key insight is trading space for time: store each number in a hash map so you can check in O(1) if the complement exists.

## Step-by-Step Breakdown

1. Create an empty hash map \`seen = {}\` mapping value → index.
2. For each number \`num\` at index \`i\`:
   - Compute \`complement = target - num\`
   - If \`complement\` is in \`seen\`, return \`[seen[complement], i]\`
   - Otherwise store \`seen[num] = i\`
3. The problem guarantees exactly one solution, so no fallback needed.

${C}python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
${C}

## Complexity Analysis
- **Time:** O(n) — single pass through the array
- **Space:** O(n) — hash map stores up to n elements

## Key Tips & Edge Cases
- A number can be used with itself only if it appears **twice** (e.g., target=6, nums=[3,3]).
- The brute-force nested loop approach is O(n²) — avoid it.
- If asked for indices, use a hash map. If asked to return the values (variant), sort + two pointers works in O(n log n) with O(1) space.`,
    quiz: [
      {
        question: 'What is the time complexity of the hash map solution for Two Sum?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'We do a single pass and each hash map lookup is O(1), giving O(n) overall.'
      },
      {
        question: 'What do we store in the hash map for Two Sum?',
        options: ['index → value', 'value → index', 'value → complement', 'index → complement'],
        correctAnswer: 1,
        explanation: 'We store value → index so we can quickly check if a complement exists and retrieve its index.'
      },
      {
        question: 'For nums=[3,3] and target=6, which indices are returned?',
        options: ['[0, 0]', '[1, 1]', '[0, 1]', 'None — invalid input'],
        correctAnswer: 2,
        explanation: 'The two 3s at indices 0 and 1 sum to 6. We store the first 3 before checking the second.'
      }
    ]
  },
  {
    keywords: ['binary search'],
    topic: 'Binary Search',
    answer: `## Binary Search

Binary search finds a target in a **sorted** array in O(log n) time by repeatedly halving the search space. Each step eliminates half of the remaining candidates.

## Step-by-Step Breakdown

1. Set \`lo = 0\`, \`hi = len(nums) - 1\`.
2. While \`lo <= hi\`:
   - Compute \`mid = lo + (hi - lo) // 2\` (avoids integer overflow).
   - If \`nums[mid] == target\` → return \`mid\`.
   - If \`nums[mid] < target\` → search right: \`lo = mid + 1\`.
   - If \`nums[mid] > target\` → search left: \`hi = mid - 1\`.
3. Return -1 if not found.

${C}python
def binarySearch(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
${C}

## Complexity Analysis
- **Time:** O(log n) — search space halves each iteration
- **Space:** O(1) iterative / O(log n) recursive (call stack)

## Key Tips & Edge Cases
- Array **must be sorted** — binary search is undefined on unsorted input.
- Use \`lo + (hi - lo) // 2\` instead of \`(lo + hi) // 2\` to prevent overflow in other languages.
- Off-by-one errors are common: remember \`lo <= hi\` (not \`<\`) with \`lo = mid + 1\` / \`hi = mid - 1\`.
- Variants: find first/last occurrence, find insertion position (\`bisect_left\`/\`bisect_right\` in Python).`,
    quiz: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'The search space halves each step, giving log₂(n) iterations.'
      },
      {
        question: 'Why use mid = lo + (hi - lo) // 2 instead of (lo + hi) // 2?',
        options: ['It is faster', 'It avoids integer overflow', 'It handles duplicates better', 'No difference'],
        correctAnswer: 1,
        explanation: 'In languages with fixed-size integers, lo + hi can overflow. The subtraction form stays within bounds.'
      },
      {
        question: 'Binary search requires the input to be:',
        options: ['Unsorted', 'Sorted', 'Distinct values only', 'Non-negative values only'],
        correctAnswer: 1,
        explanation: 'Binary search relies on sorted order to decide which half to discard at each step.'
      }
    ]
  },
  {
    keywords: ['reverse linked list', 'reverse a linked list'],
    topic: 'Reverse Linked List',
    answer: `## Reverse Linked List

Reverse the direction of all \`next\` pointers in a singly linked list. The iterative approach uses three pointers; the recursive approach uses the call stack.

## Step-by-Step Breakdown (Iterative)

1. Initialize \`prev = None\`, \`curr = head\`.
2. While \`curr\` is not None:
   - Save \`next_node = curr.next\`
   - Point \`curr.next = prev\` (reverse the link)
   - Move \`prev = curr\`, \`curr = next_node\`
3. Return \`prev\` (new head).

${C}python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Iterative — O(1) space
def reverseList(head: ListNode) -> ListNode:
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev

# Recursive — O(n) space (call stack)
def reverseListRecursive(head: ListNode) -> ListNode:
    if not head or not head.next:
        return head
    new_head = reverseListRecursive(head.next)
    head.next.next = head
    head.next = None
    return new_head
${C}

## Complexity Analysis
- **Time:** O(n) — visit every node once
- **Space:** O(1) iterative / O(n) recursive

## Key Tips & Edge Cases
- Always save \`curr.next\` before overwriting it — otherwise you lose the rest of the list.
- Empty list and single-node list both return \`head\` unchanged — handle these naturally with the loop condition.
- Prefer iterative in interviews to show you understand the pointer manipulation.`,
    quiz: [
      {
        question: 'What is the space complexity of the iterative reverse linked list solution?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Iterative uses only three pointers (prev, curr, next_node) regardless of list length.'
      },
      {
        question: 'Why must we save curr.next before modifying curr.next?',
        options: ['To track the new head', 'To avoid losing the rest of the list', 'To detect cycles', 'To handle the base case'],
        correctAnswer: 1,
        explanation: 'Once we set curr.next = prev, the original next node is unreachable unless saved first.'
      },
      {
        question: 'What does the recursive reverse return as the new head?',
        options: ['The original head', 'The last node of the original list', 'None', 'The middle node'],
        correctAnswer: 1,
        explanation: 'Recursion reaches the last node and bubbles it up as the new head of the reversed list.'
      }
    ]
  },
  {
    keywords: ['valid parentheses', 'balanced parentheses', 'matching brackets'],
    topic: 'Valid Parentheses',
    answer: `## Valid Parentheses

Determine if a string of brackets is valid: every opening bracket must be closed in the correct order. A stack is the perfect data structure — push opens, pop and verify on closes.

## Step-by-Step Breakdown

1. Create an empty stack and a mapping \`close → open\`.
2. For each character \`c\`:
   - If it's an opening bracket (\`([\{)\` → push to stack.
   - If it's a closing bracket → the stack must be non-empty and the top must match. If not → return False.
3. Return \`True\` only if the stack is empty at the end (no unmatched opens).

${C}python
def isValid(s: str) -> bool:
    stack = []
    match = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in '([{':
            stack.append(c)
        else:
            if not stack or stack[-1] != match[c]:
                return False
            stack.pop()
    return len(stack) == 0
${C}

## Complexity Analysis
- **Time:** O(n) — single pass through the string
- **Space:** O(n) — stack holds at most n/2 characters

## Key Tips & Edge Cases
- String of length 1 → always False.
- \`"([)]"\` → False (wrong nesting order, even though counts match).
- Always check \`not stack\` before accessing \`stack[-1]\` to avoid index errors.`,
    quiz: [
      {
        question: 'What data structure is best for Valid Parentheses?',
        options: ['Queue', 'Stack', 'Hash Map', 'Array with two pointers'],
        correctAnswer: 1,
        explanation: 'A stack enforces LIFO order, matching the most recent unmatched open bracket.'
      },
      {
        question: 'Is "([)]" a valid bracket string?',
        options: ['Yes', 'No'],
        correctAnswer: 1,
        explanation: 'The brackets are interleaved incorrectly. Valid requires proper nesting: "([)]" fails because ] closes [ while ( is still open.'
      },
      {
        question: 'After processing all characters, a valid string leaves the stack in what state?',
        options: ['With one element', 'Empty', 'With matched pairs', 'Unchanged'],
        correctAnswer: 1,
        explanation: 'Every opening bracket must be matched and popped. An empty stack means all were paired correctly.'
      }
    ]
  },
  {
    keywords: ['climbing stairs', 'climb stairs', 'staircase'],
    topic: 'Climbing Stairs (Dynamic Programming)',
    answer: `## Climbing Stairs

You can climb 1 or 2 steps at a time. How many distinct ways to reach step n? This is the Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2).

## Why Fibonacci?

To reach step n, you either:
- Came from step n-1 (took 1 step), or
- Came from step n-2 (took 2 steps)

So ways(n) = ways(n-1) + ways(n-2), with base cases ways(1)=1, ways(2)=2.

## Step-by-Step Breakdown

${C}python
# Approach 1: Bottom-up DP — O(n) time, O(n) space
def climbStairs_dp(n: int) -> int:
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# Approach 2: Space-optimized — O(n) time, O(1) space
def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1

# Approach 3: Memoization (top-down)
from functools import lru_cache

@lru_cache(maxsize=None)
def climbStairsMemo(n: int) -> int:
    if n <= 2:
        return n
    return climbStairsMemo(n - 1) + climbStairsMemo(n - 2)
${C}

## Complexity Analysis
- **Time:** O(n) — all three approaches
- **Space:** O(n) for DP table / memoization, O(1) for space-optimized

## Key Tips & Edge Cases
- Recognize the Fibonacci pattern quickly — it appears often in DP problems.
- The space-optimized version is preferred in interviews.
- Generalize: if you can take 1, 2, or 3 steps → ways(n) = ways(n-1) + ways(n-2) + ways(n-3).`,
    quiz: [
      {
        question: 'Why does climbStairs follow the Fibonacci pattern?',
        options: [
          'Because it involves division by 2',
          'Because the number of ways to reach step n equals the sum of ways to reach n-1 and n-2',
          'Because each step has exactly 2 options regardless of position',
          'Because the problem uses recursion'
        ],
        correctAnswer: 1,
        explanation: 'You can only arrive at step n from n-1 (1 step) or n-2 (2 steps), so the counts add together.'
      },
      {
        question: 'What is the space complexity of the space-optimized climbing stairs solution?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'We only track two variables (prev1, prev2) instead of the full DP table.'
      },
      {
        question: 'How many ways are there to climb 4 stairs (1 or 2 steps at a time)?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 2,
        explanation: 'ways(1)=1, ways(2)=2, ways(3)=3, ways(4)=5. The paths are: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.'
      }
    ]
  },
  {
    keywords: ['maximum subarray', 'max subarray', "kadane", 'largest subarray sum'],
    topic: 'Maximum Subarray (Kadane\'s Algorithm)',
    answer: `## Maximum Subarray — Kadane's Algorithm

Find the contiguous subarray with the largest sum. Kadane's insight: at each position, either extend the current subarray or start fresh (whichever is larger).

## Step-by-Step Breakdown

1. Initialize \`current_sum = nums[0]\`, \`max_sum = nums[0]\`.
2. For each number from index 1 onward:
   - \`current_sum = max(num, current_sum + num)\`
     - If adding \`num\` to the running sum makes it smaller than just \`num\` alone, start a new subarray.
   - Update \`max_sum = max(max_sum, current_sum)\`.
3. Return \`max_sum\`.

${C}python
def maxSubArray(nums: list[int]) -> int:
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
${C}

## Complexity Analysis
- **Time:** O(n) — single pass
- **Space:** O(1) — only two variables

## Key Tips & Edge Cases
- All negative numbers: Kadane's still works — it returns the least negative element.
- Initialize with \`nums[0]\`, not \`0\`, to handle all-negative arrays correctly.
- If you also need to return the subarray indices, track \`start\`, \`end\`, and \`temp_start\` separately.`,
    quiz: [
      {
        question: 'What does Kadane\'s algorithm decide at each step?',
        options: [
          'Whether to sort the remaining elements',
          'Whether to extend the current subarray or start a new one',
          'Whether the current element is positive',
          'Whether to use divide and conquer'
        ],
        correctAnswer: 1,
        explanation: 'current_sum = max(num, current_sum + num) — if the current element alone is better, start fresh.'
      },
      {
        question: 'For nums=[-2, -3, -1], what does maxSubArray return?',
        options: ['-6', '0', '-1', '-2'],
        correctAnswer: 2,
        explanation: 'All negatives: the algorithm returns the largest single element, which is -1.'
      },
      {
        question: 'What is the time complexity of Kadane\'s algorithm?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Single linear pass through the array — O(n).'
      }
    ]
  },
  {
    keywords: ['binary tree traversal', 'tree traversal', 'inorder', 'preorder', 'postorder', 'level order'],
    topic: 'Binary Tree Traversals',
    answer: `## Binary Tree Traversals

The four main ways to visit all nodes in a binary tree.

| Traversal | Order | Use Case |
|-----------|-------|---------|
| Inorder | Left → Root → Right | BST gives sorted output |
| Preorder | Root → Left → Right | Copy / serialize a tree |
| Postorder | Left → Right → Root | Delete a tree, evaluate expressions |
| Level Order | Level by level (BFS) | Shortest path, level-based problems |

${C}python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Inorder — recursive
def inorder(root: TreeNode) -> list[int]:
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

# Preorder — recursive
def preorder(root: TreeNode) -> list[int]:
    return [root.val] + preorder(root.left) + preorder(root.right) if root else []

# Postorder — recursive
def postorder(root: TreeNode) -> list[int]:
    return postorder(root.left) + postorder(root.right) + [root.val] if root else []

# Level Order (BFS) — iterative
def levelOrder(root: TreeNode) -> list[list[int]]:
    if not root:
        return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result

# Inorder — iterative (useful to know)
def inorderIterative(root: TreeNode) -> list[int]:
    result, stack, curr = [], [], root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result
${C}

## Complexity Analysis
- **Time:** O(n) — all traversals visit every node once
- **Space:** O(h) recursive (h = tree height) / O(n) level order queue

## Key Tips & Edge Cases
- A BST's inorder traversal always yields a sorted array — great for validation problems.
- Level order BFS uses a **queue**; DFS traversals use a **stack** (or call stack).
- Tree height: O(log n) balanced, O(n) worst case (skewed tree).`,
    quiz: [
      {
        question: 'Which traversal of a BST produces a sorted output?',
        options: ['Preorder', 'Postorder', 'Inorder', 'Level Order'],
        correctAnswer: 2,
        explanation: 'Inorder (Left → Root → Right) visits BST nodes in ascending order of value.'
      },
      {
        question: 'Level Order traversal uses which data structure?',
        options: ['Stack', 'Queue', 'Hash Map', 'Priority Queue'],
        correctAnswer: 1,
        explanation: 'BFS/Level Order uses a FIFO queue to process nodes level by level.'
      },
      {
        question: 'What is the space complexity of recursive DFS tree traversal on a balanced tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 1,
        explanation: 'The call stack depth equals the tree height, which is O(log n) for a balanced tree.'
      }
    ]
  },
  {
    keywords: ['bfs', 'breadth first search', 'breadth-first'],
    topic: 'Breadth-First Search (BFS)',
    answer: `## Breadth-First Search (BFS)

BFS explores a graph or tree **level by level** — visiting all neighbors of a node before going deeper. It uses a **queue** and is ideal for finding shortest paths in unweighted graphs.

## Step-by-Step Breakdown

1. Add the start node to a queue and a \`visited\` set.
2. While the queue is not empty:
   - Dequeue a node.
   - Process it (add to result, check goal, etc.).
   - Enqueue all unvisited neighbors, marking them visited immediately.

${C}python
from collections import deque

# BFS on a graph (adjacency list)
def bfs(graph: dict, start: int) -> list[int]:
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

# BFS shortest path in unweighted graph
def shortestPath(graph: dict, start: int, end: int) -> int:
    if start == end:
        return 0
    visited = {start}
    queue = deque([(start, 0)])  # (node, distance)
    while queue:
        node, dist = queue.popleft()
        for neighbor in graph[node]:
            if neighbor == end:
                return dist + 1
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
    return -1  # not reachable

# BFS on a 2D grid (common in problems)
def bfsGrid(grid: list[list[int]], start: tuple) -> None:
    rows, cols = len(grid), len(grid[0])
    visited = {start}
    queue = deque([start])
    directions = [(0,1),(0,-1),(1,0),(-1,0)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr,nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc))
${C}

## Complexity Analysis
- **Time:** O(V + E) — visits every vertex and edge once
- **Space:** O(V) — queue and visited set

## Key Tips & Edge Cases
- Mark nodes visited **when enqueuing**, not when dequeuing — prevents adding duplicates to the queue.
- BFS guarantees the **shortest path** in unweighted graphs; use Dijkstra for weighted graphs.
- For 2D grids, the 4-direction array \`[(0,1),(0,-1),(1,0),(-1,0)]\` is a standard pattern.`,
    quiz: [
      {
        question: 'BFS uses which data structure to manage the frontier?',
        options: ['Stack', 'Queue', 'Min-heap', 'Deque (as stack)'],
        correctAnswer: 1,
        explanation: 'BFS needs FIFO ordering to explore nodes level by level — a queue provides this.'
      },
      {
        question: 'When should you mark nodes as visited in BFS?',
        options: ['When dequeuing', 'When enqueuing', 'After processing all neighbors', 'At the start of each level'],
        correctAnswer: 1,
        explanation: 'Mark when enqueuing to prevent the same node being added to the queue multiple times.'
      },
      {
        question: 'BFS guarantees shortest path for which type of graph?',
        options: ['Weighted directed graphs', 'Unweighted graphs', 'Graphs with negative edges', 'DAGs only'],
        correctAnswer: 1,
        explanation: 'BFS explores by distance, so the first time it reaches a node is via the shortest path — only valid for equal-weight (unweighted) edges.'
      }
    ]
  },
  {
    keywords: ['dfs', 'depth first search', 'depth-first'],
    topic: 'Depth-First Search (DFS)',
    answer: `## Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking. It uses a **stack** (explicit or via recursion) and is ideal for cycle detection, topological sort, and connected components.

## Step-by-Step Breakdown

1. Start at a node, mark it visited.
2. Recursively visit each unvisited neighbor.
3. Backtrack when no unvisited neighbors remain.

${C}python
# DFS — recursive
def dfs_recursive(graph: dict, node: int, visited: set) -> None:
    visited.add(node)
    print(node)  # process node
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)

# DFS — iterative (explicit stack)
def dfs_iterative(graph: dict, start: int) -> list[int]:
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return order

# DFS on a 2D grid — find island size
def islandSize(grid: list[list[str]], r: int, c: int, visited: set) -> int:
    rows, cols = len(grid), len(grid[0])
    if (r < 0 or r >= rows or c < 0 or c >= cols
            or (r, c) in visited or grid[r][c] == '0'):
        return 0
    visited.add((r, c))
    return (1 + islandSize(grid, r+1, c, visited)
              + islandSize(grid, r-1, c, visited)
              + islandSize(grid, r, c+1, visited)
              + islandSize(grid, r, c-1, visited))
${C}

## Complexity Analysis
- **Time:** O(V + E) — visits every vertex and edge once
- **Space:** O(V) — visited set + call stack depth (O(h) for trees)

## Key Tips & Edge Cases
- DFS does **not** guarantee shortest path — use BFS for that.
- Iterative DFS with an explicit stack may visit nodes in different order than recursive DFS.
- For cycle detection in directed graphs, track nodes in the current recursion path (gray nodes), not just visited nodes.`,
    quiz: [
      {
        question: 'What data structure does iterative DFS use?',
        options: ['Queue', 'Stack', 'Priority Queue', 'Deque (as queue)'],
        correctAnswer: 1,
        explanation: 'DFS uses LIFO (last-in, first-out) ordering — a stack provides this.'
      },
      {
        question: 'Does DFS guarantee the shortest path in an unweighted graph?',
        options: ['Yes', 'No'],
        correctAnswer: 1,
        explanation: 'DFS explores deep branches first and may reach a node via a longer path. Use BFS for shortest paths.'
      },
      {
        question: 'DFS is most useful for which of the following?',
        options: ['Shortest path in weighted graph', 'Level-by-level processing', 'Detecting cycles and connected components', 'Priority-based traversal'],
        correctAnswer: 2,
        explanation: 'DFS naturally tracks the traversal path, making it ideal for cycle detection, topological sort, and finding connected components.'
      }
    ]
  },
  {
    keywords: ['longest substring', 'substring without repeating', 'sliding window'],
    topic: 'Longest Substring Without Repeating Characters',
    answer: `## Longest Substring Without Repeating Characters

Find the length of the longest substring with all unique characters. The **sliding window** technique with a hash map solves this in O(n).

## Step-by-Step Breakdown

1. Use two pointers \`left\` and \`right\` defining the current window.
2. Track the last seen index of each character in \`char_index\`.
3. For each \`right\` pointer:
   - If \`s[right]\` was seen and its last position is inside the window (\`>= left\`), move \`left\` to skip it.
   - Update \`char_index[s[right]] = right\`.
   - Update \`max_len = max(max_len, right - left + 1)\`.

${C}python
def lengthOfLongestSubstring(s: str) -> int:
    char_index = {}  # char -> last seen index
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len
${C}

## Complexity Analysis
- **Time:** O(n) — each character processed once
- **Space:** O(min(n, charset)) — hash map size bounded by charset (26 for lowercase, 128 for ASCII)

## Key Tips & Edge Cases
- Empty string → return 0.
- All same characters (e.g., \`"aaaa"\`) → return 1.
- The condition \`char_index[char] >= left\` is crucial — the previous occurrence might be outside the current window.
- The general sliding window template: expand right, shrink left when constraint violated.`,
    quiz: [
      {
        question: 'What technique is used to solve Longest Substring Without Repeating Characters efficiently?',
        options: ['Divide and Conquer', 'Dynamic Programming', 'Sliding Window', 'Binary Search'],
        correctAnswer: 2,
        explanation: 'A sliding window with two pointers maintains a valid window of unique characters.'
      },
      {
        question: 'For s="abcabcbb", what is the answer?',
        options: ['2', '3', '4', '7'],
        correctAnswer: 1,
        explanation: 'The longest substrings without repeats are "abc" (length 3).'
      },
      {
        question: 'Why must we check char_index[char] >= left before moving the left pointer?',
        options: [
          'To avoid negative indices',
          'Because the previous occurrence might be before the current window',
          'To handle the empty string case',
          'To ensure right > left'
        ],
        correctAnswer: 1,
        explanation: 'If the repeated character\'s last position is to the left of our window, it\'s no longer in our window and we should not shrink left.'
      }
    ]
  },
  {
    keywords: ['best time to buy', 'buy sell stock', 'stock profit', 'maximum profit'],
    topic: 'Best Time to Buy and Sell Stock',
    answer: `## Best Time to Buy and Sell Stock

Find the maximum profit from one buy-sell transaction. Track the minimum price seen so far and the maximum profit achievable at each day.

## Step-by-Step Breakdown

1. Initialize \`min_price = infinity\`, \`max_profit = 0\`.
2. For each price:
   - Update \`min_price = min(min_price, price)\`.
   - Update \`max_profit = max(max_profit, price - min_price)\`.
3. Return \`max_profit\`.

${C}python
def maxProfit(prices: list[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit
${C}

## Complexity Analysis
- **Time:** O(n) — single pass
- **Space:** O(1)

## Key Tips & Edge Cases
- If prices only decrease, \`max_profit\` stays 0 (no profitable trade).
- You must buy before you sell — tracking \`min_price\` ensures this.
- Variant (unlimited transactions): use a greedy approach — sum all upward moves.`,
    quiz: [
      {
        question: 'For prices=[7,1,5,3,6,4], what is the maximum profit?',
        options: ['5', '6', '7', '4'],
        correctAnswer: 0,
        explanation: 'Buy at 1, sell at 6 → profit = 5.'
      },
      {
        question: 'Why do we initialize max_profit = 0?',
        options: [
          'To avoid division by zero',
          'Because we can always choose not to trade and make 0 profit',
          'Because prices are always positive',
          'To handle empty arrays'
        ],
        correctAnswer: 1,
        explanation: 'If no profitable trade exists (prices only fall), not trading gives 0 profit.'
      },
      {
        question: 'What is the time complexity of the single-pass stock solution?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'One pass through the prices array — O(n).'
      }
    ]
  },
  {
    keywords: ['product of array', 'product except self', 'prefix suffix'],
    topic: 'Product of Array Except Self',
    answer: `## Product of Array Except Self

Return an array where each element is the product of all other elements, **without using division** and in O(n).

## Step-by-Step Breakdown

1. **Left pass:** For each index i, compute the product of all elements to the **left** of i.
2. **Right pass:** Multiply each position by the product of all elements to the **right** of i.
3. No division needed — just two passes.

${C}python
def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [1] * n

    # Left pass: result[i] = product of nums[0..i-1]
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    # Right pass: multiply result[i] by product of nums[i+1..n-1]
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result
${C}

## Complexity Analysis
- **Time:** O(n) — two passes
- **Space:** O(1) extra (output array doesn't count)

## Key Tips & Edge Cases
- Arrays with zeros: if one zero, all products except that index are 0. If two zeros, all products are 0.
- The constraint "no division" is what makes this problem interesting — division would trivialize it.`,
    quiz: [
      {
        question: 'For nums=[1,2,3,4], what is the output?',
        options: ['[24,12,8,6]', '[2,3,4,1]', '[1,2,6,24]', '[4,3,2,1]'],
        correctAnswer: 0,
        explanation: 'result[0]=2×3×4=24, result[1]=1×3×4=12, result[2]=1×2×4=8, result[3]=1×2×3=6.'
      },
      {
        question: 'Why is division not used in the optimal solution?',
        options: [
          'Division is slower than multiplication',
          'The problem constraints forbid it',
          'Division does not work with floating point',
          'Division would require O(n²) time'
        ],
        correctAnswer: 1,
        explanation: 'The problem explicitly says not to use division, pushing you toward the prefix-suffix pattern.'
      },
      {
        question: 'What does the left pass store in result[i]?',
        options: [
          'Product of all elements',
          'Product of elements to the right of i',
          'Product of elements to the left of i',
          'The element itself'
        ],
        correctAnswer: 2,
        explanation: 'Left pass: result[i] = nums[0] × nums[1] × ... × nums[i-1].'
      }
    ]
  },
  {
    keywords: ['three sum', '3sum', 'triplet', 'three numbers'],
    topic: '3Sum',
    answer: `## 3Sum

Find all unique triplets that sum to zero. The key insight: sort first, then use a fixed pointer + two-pointer scan to avoid duplicates and achieve O(n²).

## Step-by-Step Breakdown

1. **Sort** the array.
2. For each index \`i\` (the fixed element):
   - Skip duplicates: if \`nums[i] == nums[i-1]\`, continue.
   - Set \`lo = i+1\`, \`hi = n-1\` (two pointers).
   - While \`lo < hi\`:
     - If sum == 0 → add triplet, skip duplicate values for both pointers.
     - If sum < 0 → move \`lo\` right.
     - If sum > 0 → move \`hi\` left.

${C}python
def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break  # all remaining triplets will be > 0
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # skip duplicate fixed element
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            total = nums[i] + nums[lo] + nums[hi]
            if total == 0:
                result.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]: lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]: hi -= 1
                lo += 1
                hi -= 1
            elif total < 0:
                lo += 1
            else:
                hi -= 1
    return result
${C}

## Complexity Analysis
- **Time:** O(n²) — O(n log n) sort + O(n²) two-pointer scan
- **Space:** O(1) extra (ignoring output)

## Key Tips & Edge Cases
- Sorting is mandatory — it enables both the two-pointer technique and easy duplicate skipping.
- Three separate duplicate-skipping checks: for \`i\`, for \`lo\`, and for \`hi\`.
- Early exit: if \`nums[i] > 0\`, no triplet can sum to 0 (all remaining are larger).`,
    quiz: [
      {
        question: 'Why do we sort the array first in 3Sum?',
        options: [
          'To find the median',
          'To enable two-pointer technique and easy duplicate skipping',
          'To reduce time complexity to O(n)',
          'To handle negative numbers'
        ],
        correctAnswer: 1,
        explanation: 'Sorting allows two pointers to converge toward the target sum, and adjacent duplicates are easy to skip.'
      },
      {
        question: 'What is the time complexity of the optimal 3Sum solution?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        correctAnswer: 2,
        explanation: 'O(n log n) sort + O(n) outer loop × O(n) two-pointer inner loop = O(n²).'
      },
      {
        question: 'Why can we break early when nums[i] > 0?',
        options: [
          'Because all numbers after are sorted',
          'Because lo and hi are always positive',
          'Because sorted array means all three numbers will be positive and cannot sum to 0',
          'To handle the empty array case'
        ],
        correctAnswer: 2,
        explanation: 'If the smallest of the three (nums[i]) is positive, nums[lo] and nums[hi] are both >= nums[i] > 0, so the sum is always > 0.'
      }
    ]
  },
  {
    keywords: ['container with most water', 'most water', 'max water', 'trapping water'],
    topic: 'Container With Most Water',
    answer: `## Container With Most Water

Given heights of vertical lines, find two lines that together with the x-axis form a container holding the most water. Use the **two-pointer** approach.

## Step-by-Step Breakdown

1. Place \`lo = 0\`, \`hi = n-1\` at both ends.
2. Compute \`area = min(height[lo], height[hi]) × (hi - lo)\`.
3. Move the pointer pointing to the **shorter** line inward (it's the bottleneck).
4. Repeat until pointers meet. Track \`max_area\`.

${C}python
def maxArea(height: list[int]) -> int:
    lo, hi = 0, len(height) - 1
    max_area = 0
    while lo < hi:
        area = min(height[lo], height[hi]) * (hi - lo)
        max_area = max(max_area, area)
        if height[lo] < height[hi]:
            lo += 1
        else:
            hi -= 1
    return max_area
${C}

## Complexity Analysis
- **Time:** O(n) — pointers meet in one pass
- **Space:** O(1)

## Key Tips & Edge Cases
- We move the shorter pointer because moving the taller one can only decrease width while height stays bounded by the shorter — no gain.
- This is different from **Trapping Rain Water** (harder — requires knowing both left and right maximums for each bar).`,
    quiz: [
      {
        question: 'Why do we move the shorter-height pointer inward?',
        options: [
          'To maximize width',
          'Because moving the taller pointer cannot improve the area (height is still bounded by the shorter)',
          'To sort the heights',
          'To avoid integer overflow'
        ],
        correctAnswer: 1,
        explanation: 'Area = min(h[lo], h[hi]) × width. Moving the taller pointer keeps height the same or less, while width decreases — guaranteed worse or equal.'
      },
      {
        question: 'What is the time complexity of the two-pointer solution for Container With Most Water?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Pointers move from both ends toward the center — each step processes one element, giving O(n).'
      }
    ]
  },
  {
    keywords: ['merge sort', 'mergesort'],
    topic: 'Merge Sort',
    answer: `## Merge Sort

A divide-and-conquer sorting algorithm that splits the array in half, recursively sorts each half, then merges them. Guaranteed O(n log n) in all cases.

## Step-by-Step Breakdown

1. **Base case:** If length ≤ 1, return.
2. Split array into left and right halves.
3. Recursively sort each half.
4. **Merge:** Two-pointer merge of the two sorted halves into a single sorted array.

${C}python
def mergeSort(nums: list[int]) -> list[int]:
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = mergeSort(nums[:mid])
    right = mergeSort(nums[mid:])
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
${C}

## Complexity Analysis
- **Time:** O(n log n) — log n levels × O(n) merge at each level
- **Space:** O(n) — merge requires auxiliary arrays

## Key Tips & Edge Cases
- **Stable** sort — equal elements preserve relative order.
- Better than Quick Sort in worst case (always O(n log n) vs. O(n²) for Quick Sort).
- Used in Python's \`timsort\` (the built-in sort) for merging runs.
- Great for **counting inversions** (modify merge to count swaps).`,
    quiz: [
      {
        question: 'What is the worst-case time complexity of Merge Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'Merge Sort always divides into log n levels and each merge step is O(n), giving O(n log n) in all cases.'
      },
      {
        question: 'Why does Merge Sort require O(n) extra space?',
        options: [
          'For the call stack',
          'For auxiliary arrays during the merge step',
          'For the pivot element',
          'It does not require extra space'
        ],
        correctAnswer: 1,
        explanation: 'The merge step creates new arrays to combine two sorted halves, requiring O(n) auxiliary space.'
      },
      {
        question: 'Is Merge Sort a stable sorting algorithm?',
        options: ['Yes', 'No'],
        correctAnswer: 0,
        explanation: 'Merge Sort is stable — equal elements maintain their original relative order because we use <= in the merge comparison.'
      }
    ]
  },
  {
    keywords: ['quick sort', 'quicksort'],
    topic: 'Quick Sort',
    answer: `## Quick Sort

A divide-and-conquer sort that picks a pivot, partitions elements around it, and recursively sorts sub-arrays. Average O(n log n), in-place.

## Step-by-Step Breakdown

1. Pick a **pivot** (commonly last element or random).
2. **Partition:** rearrange so all elements < pivot are left, all > pivot are right.
3. Recursively sort left and right sub-arrays.

${C}python
import random

def quickSort(nums: list[int], lo: int = 0, hi: int = None) -> None:
    if hi is None:
        hi = len(nums) - 1
    if lo < hi:
        pivot_idx = partition(nums, lo, hi)
        quickSort(nums, lo, pivot_idx - 1)
        quickSort(nums, pivot_idx + 1, hi)

def partition(nums: list[int], lo: int, hi: int) -> int:
    # Randomize pivot to avoid worst-case on sorted input
    rand_idx = random.randint(lo, hi)
    nums[rand_idx], nums[hi] = nums[hi], nums[rand_idx]
    pivot = nums[hi]
    i = lo - 1  # boundary of elements < pivot
    for j in range(lo, hi):
        if nums[j] <= pivot:
            i += 1
            nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1], nums[hi] = nums[hi], nums[i + 1]
    return i + 1
${C}

## Complexity Analysis
- **Time:** O(n log n) average, O(n²) worst case (sorted input without randomization)
- **Space:** O(log n) average call stack, O(n) worst case

## Key Tips & Edge Cases
- Always **randomize the pivot** to avoid O(n²) on sorted/reverse-sorted input.
- Quick Sort is **not stable** — equal elements may swap relative order.
- In-place: more cache-friendly than Merge Sort.
- Python's built-in \`sort()\` uses Timsort, not Quick Sort.`,
    quiz: [
      {
        question: 'What is the worst-case time complexity of Quick Sort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'If the pivot is always the smallest or largest element (e.g., sorted input), partitions are unbalanced and Quick Sort degrades to O(n²).'
      },
      {
        question: 'Why should the pivot be randomized?',
        options: [
          'To make the sort stable',
          'To avoid O(n²) worst case on already-sorted input',
          'To reduce space complexity',
          'To handle duplicate elements'
        ],
        correctAnswer: 1,
        explanation: 'A random pivot makes it very unlikely to repeatedly pick the worst element, giving O(n log n) expected time.'
      },
      {
        question: 'Is Quick Sort an in-place algorithm?',
        options: ['Yes', 'No'],
        correctAnswer: 0,
        explanation: 'Quick Sort partitions in-place using only O(log n) stack space for recursion.'
      }
    ]
  },
  {
    keywords: ['heap', 'priority queue', 'min heap', 'max heap', 'heapify'],
    topic: 'Heap / Priority Queue',
    answer: `## Heap / Priority Queue

A heap is a complete binary tree where every parent satisfies the heap property:
- **Min-heap:** parent ≤ children (smallest element at root)
- **Max-heap:** parent ≥ children (largest element at root)

Python's \`heapq\` module provides a **min-heap**.

## Key Operations

| Operation | Time |
|-----------|------|
| Push | O(log n) |
| Pop min | O(log n) |
| Peek min | O(1) |
| Build heap from list | O(n) |

${C}python
import heapq

# Min-heap (default in Python)
heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 4)
print(heapq.heappop(heap))  # 1 (smallest)

# Max-heap — negate values
max_heap = []
heapq.heappush(max_heap, -3)
heapq.heappush(max_heap, -1)
print(-heapq.heappop(max_heap))  # 3 (largest)

# Build from list — O(n)
nums = [3, 1, 4, 1, 5]
heapq.heapify(nums)

# K largest elements
def kLargest(nums: list[int], k: int) -> list[int]:
    return heapq.nlargest(k, nums)

# K smallest elements
def kSmallest(nums: list[int], k: int) -> list[int]:
    return heapq.nsmallest(k, nums)

# Kth largest using min-heap of size k
def findKthLargest(nums: list[int], k: int) -> int:
    heap = nums[:k]
    heapq.heapify(heap)
    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)
    return heap[0]
${C}

## Complexity Analysis
- **kth Largest:** O(n log k) — maintains a heap of size k
- **Build heap:** O(n) — more efficient than pushing n elements one by one

## Key Tips & Edge Cases
- Python only has min-heap; negate values for max-heap behavior.
- Use a heap of size k for "top k" / "kth largest" problems — more efficient than sorting (O(n log k) vs O(n log n)).
- \`heapq.heapreplace\` is faster than pop + push.`,
    quiz: [
      {
        question: 'How do you implement a max-heap in Python using heapq?',
        options: [
          'Use heapq.maxheap()',
          'Set reverse=True in heappush',
          'Negate the values before pushing',
          'Python automatically handles max-heaps'
        ],
        correctAnswer: 2,
        explanation: 'Python\'s heapq is always a min-heap. Negate values (push -x, retrieve -heap[0]) to simulate a max-heap.'
      },
      {
        question: 'What is the time complexity of heapq.heappush() and heappop()?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'Both operations bubble up or down through the heap tree, which has height log n.'
      },
      {
        question: 'For finding the kth largest element, which approach is more efficient?',
        options: [
          'Sort the array — O(n log n)',
          'Min-heap of size k — O(n log k)',
          'Max-heap of all elements — O(n + k log n)',
          'Linear scan — O(n)'
        ],
        correctAnswer: 1,
        explanation: 'A min-heap of size k maintains the top k elements. Processing each of the n elements is O(log k), giving O(n log k) total.'
      }
    ]
  },
  {
    keywords: ['trie', 'prefix tree', 'autocomplete'],
    topic: 'Trie (Prefix Tree)',
    answer: `## Trie (Prefix Tree)

A trie is a tree where each node represents a character. It enables O(L) insert/search (L = word length) and is ideal for prefix-based problems like autocomplete and spell checking.

## Structure

Each node contains:
- A dictionary of children (char → TrieNode)
- A boolean \`is_end\` marking the end of a valid word

${C}python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True  # reached end of prefix

# Usage
trie = Trie()
trie.insert("apple")
print(trie.search("apple"))    # True
print(trie.search("app"))      # False (not a complete word)
print(trie.startsWith("app"))  # True
${C}

## Complexity Analysis
- **Insert / Search / StartsWith:** O(L) — L is the word length
- **Space:** O(total characters across all words) — O(n × L) in the worst case

## Key Tips & Edge Cases
- Use \`is_end\` to distinguish between "apple" (inserted) and "app" (prefix only).
- For wildcard search (\`.\` matches any char), use DFS through the trie.
- A dictionary of children is flexible; an array of 26 slots is faster for lowercase-only inputs.`,
    quiz: [
      {
        question: 'What is the time complexity of Trie insert and search?',
        options: ['O(n)', 'O(L) where L is word length', 'O(log n)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Each operation traverses one node per character of the word — O(L) where L is the word length.'
      },
      {
        question: 'What does the is_end flag in a TrieNode represent?',
        options: [
          'The node has no children',
          'The node is the root',
          'A complete word ends at this node',
          'The character at this node is a vowel'
        ],
        correctAnswer: 2,
        explanation: 'is_end distinguishes between "app" (prefix) and "apple" (full word inserted). Without it, startsWith and search would be identical.'
      },
      {
        question: 'Tries are most useful for which type of problem?',
        options: [
          'Sorting integers',
          'Finding shortest paths',
          'Prefix-based word search and autocomplete',
          'Graph cycle detection'
        ],
        correctAnswer: 2,
        explanation: 'Tries encode shared prefixes efficiently, making prefix lookups O(prefix length) instead of scanning all words.'
      }
    ]
  },
  {
    keywords: ['backtracking', 'permutation', 'combination', 'subset', 'n-queens'],
    topic: 'Backtracking',
    answer: `## Backtracking

Backtracking is a general algorithm for finding all solutions by incrementally building candidates and **abandoning** (backtracking) paths that cannot lead to a valid solution.

## General Template

${C}python
def backtrack(path, choices):
    if is_complete(path):
        result.append(path[:])  # save a copy
        return
    for choice in choices:
        if is_valid(path, choice):
            path.append(choice)       # make choice
            backtrack(path, ...)      # recurse
            path.pop()                # undo choice (backtrack)
${C}

## Classic Examples

${C}python
# Subsets — 2^n subsets
def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    def bt(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1, path)
            path.pop()
    bt(0, [])
    return result

# Permutations — n! permutations
def permute(nums: list[int]) -> list[list[int]]:
    result = []
    def bt(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i, num in enumerate(remaining):
            path.append(num)
            bt(path, remaining[:i] + remaining[i+1:])
            path.pop()
    bt([], nums)
    return result

# Combinations — C(n, k)
def combine(n: int, k: int) -> list[list[int]]:
    result = []
    def bt(start, path):
        if len(path) == k:
            result.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            bt(i + 1, path)
            path.pop()
    bt(1, [])
    return result
${C}

## Complexity Analysis
- **Subsets:** O(2ⁿ × n) — 2ⁿ subsets, each copied in O(n)
- **Permutations:** O(n! × n)
- **Combinations:** O(C(n,k) × k)

## Key Tips & Edge Cases
- Always append a **copy** of path (\`path[:]\`), not the path itself.
- Use \`start\` index to avoid reusing elements (subsets/combinations).
- Pruning (skipping invalid choices early) dramatically reduces runtime.`,
    quiz: [
      {
        question: 'Why do we append path[:] instead of path in backtracking?',
        options: [
          'To sort the path',
          'Because path is modified later — we need a snapshot',
          'To avoid recursion depth issues',
          'For faster appending'
        ],
        correctAnswer: 1,
        explanation: 'path is mutated during backtracking. Without copying, all entries in result would reference the same (eventually empty) list.'
      },
      {
        question: 'What is the number of subsets of a set with n elements?',
        options: ['n!', 'n²', '2ⁿ', 'n log n'],
        correctAnswer: 2,
        explanation: 'Each element is either included or excluded — 2 choices per element, giving 2ⁿ subsets.'
      },
      {
        question: 'How do we prevent reusing the same element in subset/combination backtracking?',
        options: [
          'Use a visited set',
          'Pass a start index and only iterate from start onward',
          'Sort the array first',
          'Use a global counter'
        ],
        correctAnswer: 1,
        explanation: 'Passing start = i+1 in each recursive call ensures we only pick elements ahead of the current position.'
      }
    ]
  },
  {
    keywords: ['dynamic programming', 'dp basics', 'memoization', 'tabulation'],
    topic: 'Dynamic Programming (DP)',
    answer: `## Dynamic Programming

DP solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation. Two main approaches: **top-down (memoization)** and **bottom-up (tabulation)**.

## When to Use DP

1. **Optimal substructure:** optimal solution uses optimal solutions to subproblems.
2. **Overlapping subproblems:** same subproblems solved multiple times.

Common patterns: counting ways, maximizing/minimizing, yes/no reachability.

## Two Approaches

${C}python
# Problem: Fibonacci (classic DP example)

# Top-down — memoization (recursive + cache)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n: int) -> int:
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

# Bottom-up — tabulation (iterative)
def fib_tab(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# Space-optimized (O(1))
def fib_opt(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Classic 2D DP: Unique Paths in a grid
def uniquePaths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r-1][c] + dp[r][c-1]
    return dp[m-1][n-1]
${C}

## Complexity Analysis
- **Memoization/Tabulation:** O(n) time and space for Fibonacci
- **Space-optimized:** O(1) space when only recent states needed

## Key Tips & Edge Cases
- Start with recursion → add memoization → convert to tabulation → optimize space.
- Identify the **state** (what changes between subproblems) and the **recurrence relation**.
- Bottom-up is usually faster (no recursion overhead) but harder to derive initially.`,
    quiz: [
      {
        question: 'What are the two key properties a problem must have for DP to apply?',
        options: [
          'Sorted input and constant space',
          'Optimal substructure and overlapping subproblems',
          'Greedy choice property and divide-and-conquer structure',
          'Binary structure and logarithmic depth'
        ],
        correctAnswer: 1,
        explanation: 'DP works when subproblems overlap (recomputation can be avoided) and optimal solutions compose from optimal subproblems.'
      },
      {
        question: 'What is the difference between memoization and tabulation?',
        options: [
          'Memoization is bottom-up; tabulation is top-down',
          'Memoization is top-down (recursive + cache); tabulation is bottom-up (iterative)',
          'They are identical in approach',
          'Tabulation always uses more space'
        ],
        correctAnswer: 1,
        explanation: 'Memoization starts from the original problem and caches recursive calls. Tabulation builds solutions from base cases upward iteratively.'
      },
      {
        question: 'Why is the space-optimized Fibonacci O(1) space?',
        options: [
          'It uses bit manipulation',
          'It only tracks the last two values instead of the full DP table',
          'It uses a mathematical formula',
          'It avoids recursion entirely'
        ],
        correctAnswer: 1,
        explanation: 'Fibonacci only needs the previous two values to compute the next one, so we can replace the O(n) table with two variables.'
      }
    ]
  },
  {
    keywords: ['linked list', 'singly linked', 'detect cycle', 'find middle', 'merge sorted list'],
    topic: 'Linked List Essentials',
    answer: `## Linked List Essentials

Key linked list techniques: find middle, detect cycle, merge sorted lists.

${C}python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Find middle node — slow/fast pointers
def findMiddle(head: ListNode) -> ListNode:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow  # slow is at middle

# Detect cycle — Floyd's algorithm
def hasCycle(head: ListNode) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Merge two sorted lists
def mergeTwoLists(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1; l1 = l1.next
        else:
            curr.next = l2; l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2  # attach remaining
    return dummy.next

# Remove nth node from end — two passes or one pass
def removeNthFromEnd(head: ListNode, n: int) -> ListNode:
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next
${C}

## Complexity Analysis
- **Find middle:** O(n) time, O(1) space
- **Detect cycle:** O(n) time, O(1) space
- **Merge sorted:** O(n+m) time, O(1) space
- **Remove nth from end:** O(n) time, O(1) space

## Key Tips
- Use a **dummy node** to simplify edge cases (empty list, removing head).
- **Slow/fast pointers** solve middle, cycle, and nth-from-end problems.
- Floyd's cycle detection: when slow and fast meet, reset one to head and advance both by 1 to find cycle start.`,
    quiz: [
      {
        question: 'In Floyd\'s cycle detection, what does it mean when slow and fast pointers meet?',
        options: [
          'The list has an even number of nodes',
          'A cycle exists in the linked list',
          'The list is sorted',
          'slow is at the middle'
        ],
        correctAnswer: 1,
        explanation: 'Fast moves 2x as fast as slow. They can only meet if fast laps slow, which only happens in a cycle.'
      },
      {
        question: 'Why is a dummy node useful in linked list problems?',
        options: [
          'To increase list size by 1',
          'To simplify edge cases like removing the head node',
          'To detect cycles',
          'To find the middle more efficiently'
        ],
        correctAnswer: 1,
        explanation: 'A dummy node before head means removal/insertion logic is uniform — no special case for the head node.'
      },
      {
        question: 'In the slow/fast pointer approach to find the middle, fast moves how much faster?',
        options: ['1 step', '2 steps', '3 steps', 'n/2 steps'],
        correctAnswer: 1,
        explanation: 'fast = fast.next.next (2 steps) while slow = slow.next (1 step). When fast reaches the end, slow is at the middle.'
      }
    ]
  },
  {
    keywords: ['graph', 'number of islands', 'connected components', 'union find'],
    topic: 'Graph Traversal & Islands',
    answer: `## Graph Traversal & Number of Islands

"Number of Islands" is the classic graph traversal problem on a 2D grid. Count connected components of '1's.

${C}python
# Number of Islands — DFS approach
def numIslands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'  # mark visited by sinking the island
        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count

# Union-Find (Disjoint Set Union) — O(α(n)) ≈ O(1) per operation
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True
${C}

## Complexity Analysis
- **DFS/BFS island:** O(m × n) time and space
- **Union-Find:** O(α(n)) per operation (effectively constant)

## Key Tips & Edge Cases
- Sinking visited '1' cells to '0' avoids a separate visited set.
- For graphs with bidirectional edges, always use a visited set to avoid infinite recursion.
- Union-Find is great for dynamic connectivity problems (edges added online).`,
    quiz: [
      {
        question: 'In the Number of Islands problem, why do we set grid[r][c] = "0" during DFS?',
        options: [
          'To count the island',
          'To mark the cell as visited and prevent revisiting',
          'To reset the grid after searching',
          'To handle edge cells'
        ],
        correctAnswer: 1,
        explanation: 'Sinking the cell (marking it \'0\') serves as the visited marker, avoiding an extra O(m×n) visited set.'
      },
      {
        question: 'What does path compression do in Union-Find?',
        options: [
          'Reduces the number of nodes',
          'Makes every node point directly to the root, flattening the tree',
          'Merges two sets into one',
          'Finds the shortest path'
        ],
        correctAnswer: 1,
        explanation: 'Path compression recursively sets each node\'s parent to the root, making future find() calls nearly O(1).'
      }
    ]
  }
];

export function findOfflineAnswer(question) {
  const q = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (const entry of OFFLINE_DB) {
    if (entry.keywords.some(kw => q.includes(kw))) {
      return entry;
    }
  }
  return null;
}

export const OFFLINE_TOPICS = OFFLINE_DB.map(e => e.topic);
