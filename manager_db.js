var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("leveldown") };
LinvoDB.dbPath = process.cwd();

class Manager_Db{

	constructor(props) {
		this.db={}
		this.db.users= new LinvoDB("users", { /* schema, can be empty */ })
		this.db.waiting_invoice= new LinvoDB("waiting_invoice", { /* schema, can be empty */ })
		this.db.files_cache= new LinvoDB("files_cache", { /* schema, can be empty */ })
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
	
	update_user_password_by_email(email,password_hash){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){return res({err:true,result:null})}
				doc.password_hash = password_hash;
				doc.save(function(err) {
					if(err){res({err:true,result:null});return}
					res({err:false,result:true})
				}); 
			});	        		
		})		
	}

	update_user_palance_by_email(email,new_palance){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){return res({err:true,result:null})}
				doc.palance = new_palance;
				doc.save(function(err) {
					if(err){return res({err:true,result:null})}
					res({err:false,result:true})
				}); 
			});	        		
		})		
	}
	update_user_download_list_by_email(email,download_list){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){return res({err:true,result:null})}
				doc.download_list = download_list;
				doc.save(function(err) {
					if(err){return res({err:true,result:null})}
					res({err:false,result:true})
				}); 
			});	        		
		})		
	}	
	get_user_picture_by_email(email,new_username){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				if(doc==null){return res({err:true,result:null})}
				var picture=doc.picture;
				res({err:false,result:picture})
			});	        		
		})		
	}

	get_user_palance_by_email(email){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				if(doc==null){return res({err:true,result:null})}
				var palance=doc.palance;
				res({err:false,result:palance})
			});	        		
		})		
	}

	get_user_download_list_by_email(email){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				if(doc==null){res({err:true,result:null})}
				var download_list=doc.download_list;
				res({err:false,result:download_list})
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


	get_file_cache_object_from_files_cache(file_key){
		return new Promise((res,rej)=>{
			this.db.files_cache.findOne({ key: file_key }, function (err, doc) {
				if(err){res({err:true,result:null})}
				res({err:false,result:doc})
			});	        		
		})		
	}

	add_file_to_files_cache(cache_object){
		return new Promise((res,rej)=>{
			this.db.files_cache.save(cache_object,async(err,docs)=>{
				console.log(docs)
				if(err){res({err:true,result:false})}
				res({err:false,result:true})
	        })			
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