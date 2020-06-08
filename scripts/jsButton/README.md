## These scripts assume you've a named credential named 'salesforce' created for your instance. The detailed steps for doing so are below:

* Create an Auth Provider of type 'Salesforce'. You can either create your own Connected App or use the following consumer key and secret. The scopes should include `api` and `refresh_token` 
* Create a named credential using the Auth Provider above and name it `salesforce`. The authentication type should be `OAuth`. For better security, I suggest you used `Per User` authentication so only authorized users can use the Salesforce APIs through the button
