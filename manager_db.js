var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("leveldown") };
LinvoDB.dbPath = process.cwd();

class Manager_Db{

	constructor(props) {
		this.db={}
		this.db.users= new LinvoDB("users", { /* schema, can be empty */ })
		this.start()
	}


	get_user_by_email(email){
		return new Promise((res,rej)=>{
			this.db.users.findOne({ email: email }, function (err, doc) {
				if(err){res({err:true,result:null})}
				res({err:false,result:doc})
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
					console.log(doc)
					res({err:false,result:true})
				}); 
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