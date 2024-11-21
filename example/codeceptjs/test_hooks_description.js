Feature('Get test description - Todos @step-11');

Before(async (I, TodosPage) => {
  TodosPage.goto();
  TodosPage.enterTodo('foo');
  TodosPage.enterTodo('bar');
});

BeforeSuite(({ I }) => {
  TodosPage.enterTodo('baz');
});

Scenario('Edited todo is saved', async (I, TodosPage) => {
  I.say('Given I have some todos');

  I.say('When I edit the first todo');
  await TodosPage.editNthTodo(1, 'boom');

  I.say('Then I see that the todo text has been changed');
  await TodosPage.seeNthTodoEquals(1, 'boom');
});

/**
 * Edge cases
 */

const examples = new DataTable(['Todo Text', 'Result']);
examples.add(['Todo with umlauts äöü', 'is in list']);
examples.add([
  'Very loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong TooooooooooooooooooooooooooooooooooooooooDooooooooooooooo',
  'is in list',
]);
examples.add(['Todo with html code <script>alert("hello")</script>', 'is in list']);

Data(examples).Scenario('Todos containing weird characters', async (I, current, TodosPage) => {
  I.say('When I enter {Todo Text}');
  TodosPage.enterTodo(current['Todo Text']);

  I.say('Then I see {Result}');
  if (current['Result'] === 'is in list') {
    TodosPage.seeNthTodoEquals(1, current['Todo Text']);
  }
});

AfterSuite(({ I }) => {
  TodosPage.enterTodo('h&m');
});
