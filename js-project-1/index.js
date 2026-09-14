
//'Go to gym', "Revision Web dev", "Take class"
let todos = [
    {
        id: Date.now() + 1,
        text: "Go to gym",
        isCompleted: false
    },
    {
        id: Date.now() + 2,
        text: "Revision Web dev",
        isCompleted: true
    },
    {
        id: Date.now() + 3,
        text: "Take class",
        isCompleted: false
    }
]


const todoForm = document.querySelector("#todo-form")
const todoInput = document.querySelector("#todo-input")
const todoList = document.querySelector("#todo-list")

todoForm.addEventListener('submit', (e) => {
    e.preventDefault()


    const todoValue = todoInput.value;
    todos.push(todoValue) // this for saving 


    let newTodo = {
        id: Date.now(),
        text: todoValue,
        isCompleted: false
    }

    addTodo(newTodo)

    // renderTodo() // jab koi naya todo add hoga first updated todos render ho jayenge

})

function renderTodo() {
    todoList.innerHTML = ""
    todos.forEach(function (todo) {
        addTodo(todo)
    })
}

renderTodo() // jab first time file execute hogi tab existing todos render ho jayenge


function addTodo(todo) {
    const li = document.createElement("li") // <li></li>
    // li.textContent = todo.text // <li> {Actuall Todo} </li>
    li.dataset.id = todo.id
    li.className = `flex gap-2 border border-slate-300 p-4 rounded-xl`
    li.innerHTML = `
                    <input data-id=${todo.id} ${todo.isCompleted === true ? 'checked' : ""} type="checkbox">
                    <p class="flex-1">${todo.text}</p>
                    <div class="flex gap-2">
                        <button data-action="edit" data-id=${todo.id}>Edit</button>
                        <button data-action="delete" data-id=${todo.id}>Delete</button>
                    </div>
    `
    todoList.append(li) // ul -> li
}


// event delegation
todoList.addEventListener('click', (e) => {

    let li = e.target.closest('li')
    let btn = e.target.closest('button')
    let action = btn?.dataset.action;
    let id = li?.dataset?.id
    let checkbox = e.target.closest('input[type="checkbox"]') // css selector to select only checkbox input element


    if (action === "edit") {
        // edit wala part
        console.log("editing....");
    }

    if (action === "delete") {
        deleteTodo(e, id)
    }

    if (checkbox) {
        todos = todos.map((todo) => {
            if (todo.id === Number(id)) {
                console.log("hii");
                return {
                    ...todo,
                    isCompleted: !todo.isCompleted
                }
            }

            return todo
        })

        console.log(todos);
    }
})

function deleteTodo(e, id) {
    e.target.closest('li').remove()

    todos = todos.filter((todo) => {
        if (todo.id !== Number(id)) {
            return todo
        }
    })
    // renderTodo() 
}