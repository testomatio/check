Feature('Search on Google');

Before(async ({I}) => {
    I.amOnPage('http://www.google.com');
});

let productSearch = new DataTable(['search','result']);
productSearch.add(['Upsell','Shopify App']);

Data(productSearch).Scenario('Search on Google', ({I,current}) => {
    I.fillField('q', current.search);
    I.click('Google Search');
    I.see(current.result);
}).tag('product-search').tag('classic-test');
