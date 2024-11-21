describe('test hooks', () => {
    const foods = ["food1", "food2", "food3"]
    // Applies only to tests in this describe block
    beforeAll(() => {
        console.log('Ran beforeAll');
        expect(foods[1]).toBeTruthy();
    });

    beforeEach(() => {
        console.log('Ran beforeEach');
        expect(foods[2]).toBeTruthy();
    });

    test('Vienna <3 veal', async () => {
        const { foods, pkg } = await generateWithPlugin({
            id: 'router',
            apply: require('../generator'),
            options: {}
        })

        expect(foods['src/router/index.js']).toBeTruthy()
    });

    test('San Juan <3 plantains', async () => {
        const foods = ["food1", "food2", "food3"];

        expect(foods[1]).toBeTruthy()
    });

    afterAll(() => {
        console.log('Ran afterAll');
        expect(foods[0]).toBeTruthy();
    });
});