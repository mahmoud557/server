var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("leveldown") };
LinvoDB.dbPath = process.cwd();

class Manager_Db{

	constructor(props) {
		this.db={}
		this.db.users= new LinvoDB("users", { /* schema, can be empty */ })
		this.db.waiting_invoice= new LinvoDB("waiting_invoice", { /* schema, can be empty */ })
		this.start()
	}

	get_user_by_email(email){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				console.log(doc)
				if(err){res({err:true,result:null})}
				res({err:false,result:doc})
			});	        		
		})		
	}

	update_user_by_email(email,new_doc){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				doc=new_doc;
				doc.save(function(err) {
					if(err){return res({err:true,result:null})}
					res({err:false,result:true})
				}); 
			});	        		
		})		
	}

	update_user_username_by_email(email,new_username){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				doc.username = new_username;
				doc.save(function(err) {
					if(err){res({err:true,result:null});return}
					res({err:false,result:true})
				}); 
			});	        		
		})		
	}

	get_user_picture_by_email(email,new_username){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				if(doc==null){res({err:true,result:null})}
				var picture=doc.picture;
				res({err:false,result:picture})
			});	        		
		})		
	}

	add_new_user(user_object){
		return new Promise((res,rej)=>{
			this.db.users.save(user_object,async(err,docs)=>{
				console.log(docs)
				if(err){res({err:true,result:false})}
				res({err:false,result:true})
	        })			
		})		
	}

	add_invoice_to_waiting_invoice_if_not_exest(invoice_object){
		return new Promise(async(res,rej)=>{
			var get_invoice_qurey_state=await this.get_invoice_from_waiting_invoice_by_id(invoice_object['invoice_id'])
			if(get_invoice_qurey_state.result){return res({err:'exest',result:false})}
			if(get_invoice_qurey_state.err){return res({err:true,result:false})}

			this.db.waiting_invoice.save(invoice_object,async(err,docs)=>{
				console.log(docs)
				if(err){res({err:true,result:false})}
				res({err:false,result:true})
	        })			
		})		
	}

	get_invoice_from_waiting_invoice_by_id(invoice_id){
		return new Promise((res,rej)=>{
			this.db.waiting_invoice.findOne({ invoice_id: invoice_id }, function (err, doc) {
				if(err){res({err:true,result:null})}
				res({err:false,result:doc})
			});	        		
		})		
	}

	remove_invoice_from_waiting_invoice_by_id(invoice_id){
		return new Promise((res,rej)=>{
			this.db.waiting_invoice.findOne({ invoice_id: invoice_id }, function (err, doc) {
				if(err){return res({err:true,result:null})}
			    doc.remove(function(err,numRemoved) {
			    	if(err){return res({err:true,result:null})}
			      	res({err:false,result:true})
			    });
			});	        		
		})		
	}

	async start(){
		//this.load_componants()
	}	


    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }

}

module.exports= new Manager_Db