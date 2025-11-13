using Microsoft.AspNetCore.Http.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        p => p.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

app.UseCors("AllowReact");

// In-memory todo list
List<Todo> todos = new();

// Routes

app.MapGet("/api/todos", () => todos);

// Get all completed todos
app.MapGet("/api/todos/complete", () => todos.Where(t => t.Completed));

// create new Todo
app.MapPost("/api/todos", (Todo newTodo) =>
{
    newTodo.Id = Guid.NewGuid();
    todos.Add(newTodo);
    return Results.Created($"/api/todos/{newTodo.Id}", newTodo);
});

// Edit todo
app.MapPut("/api/todos/{id:guid}", (Guid id, Todo inputTodo) =>
{
    var todo = todos.FirstOrDefault(t => t.Id == id);
    if (todo is null) return Results.NotFound();

    todo.Title = inputTodo.Title;
    todo.Completed = inputTodo.Completed;

    return Results.NoContent();
});


// Delete todo
app.MapDelete("/api/todos/{id:guid}", (Guid id) =>
{
    var todo = todos.FirstOrDefault(t => t.Id == id);
    if (todo is null) return Results.NotFound();
    todos.Remove(todo);
    return Results.NoContent();
});

app.MapFallbackToFile("index.html");

app.Run();

record Todo
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public bool Completed { get; set; }
}

