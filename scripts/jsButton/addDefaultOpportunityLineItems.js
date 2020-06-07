let family=prompt('What family of products would you like to add?');
if(!family)
 return;
try{
  let items = || select Id,UnitPrice from PricebookEntry where Pricebook2.Name='Standard Price Book' and IsActive=true and Product2.Family='${family}' ||;
  if(!items || items.length===0){
   alert('No Products found');
  }
  let oli = items.map(item => ({PriceBookEntryId: item.Id, OpportunityId: recordId, Quantity: 1, ListPrice: item.UnitPrice, TotalPrice: item.UnitPrice}));
  || insert OpportunityLineItem(oli) ||;
  $A.get('e.force:refreshView').fire();
}catch(e){
 alert(JSON.stringify(e));
}
