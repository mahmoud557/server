class Manager_users{
	constructor(props) {
		this.start()
	}

	async start(){
		this.handel_requstes()
		this.load_componants()
	}	


	load_componants(){
		this.sign_in = require('./componants/sign_in.js');
		this.sign_up = require('./componants/sign_up.js');
	}

	handel_requstes(){
		global.http_server
		.post('/manager_users/contanuio_with_google',async(req,res)=>{
			var  google_outh_object=await this.get_google_outh_object_from_req(req)
			if(!google_outh_object){res.end();return}
			var reqord_if_not_reqorded_state=await this.reqord_user_if_not_reqorded(google_outh_object)
			if(reqord_if_not_reqorded_state.err){res.redirect('/');return}
			this.set_log_in_cookie(res,google_outh_object['email'])
			res.redirect('/')
		})

		global.http_server
		.post('/manager_users/log_out',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req)
			if(!cookie_validate_state){res.end(); return;}
			var user_log_in_state=this.check_user_log_in_state(req.cookies['outh_token'])
			if(!user_log_in_state){res.end(); return;}
			this.set_log_out_cookie(res)
			res.json({logout_state:true})
		})	
	}

	async get_google_outh_object_from_req(req){
		try{
			if(!req.body){return false}
			if(!req.body.credential){return false}
			const ticket = await google_client.verifyIdToken({
			    idToken: req.body.credential,
			    audience: '530638225218-0bn200lkl8nqoionnv6ns2og60calf43.apps.googleusercontent.com',
			});
			if(!ticket){return false}
			if(!ticket.payload){return false}
			var google_outh_object=ticket.payload;
			return google_outh_object			
		}catch(err){
			res(false)
		}
	}

	check_requset_cookie_validat(req){
		if(!req.cookies){return {state:false}}
		if(!req.cookies['outh_token']){return {state:false}}
		return {state:true}
	}

	check_user_log_in_state(outh_token){
		try{
			var decode=jwt.verify(outh_token, 'shhhhh');
			return decode['log_in_state']
		}catch(err){
			return false
		}	
	}

	async reqord_user_if_not_reqorded(google_outh_object){
		try{
			var user_qurey=await manager_db.get_user_by_email(google_outh_object['email']);
			if(user_qurey.err){return {err:true}}
			if(!user_qurey.result){
				var user_opject={
					email:google_outh_object['email'],
					username:google_outh_object['given_name'],
					picture:google_outh_object['picture']
				};
				var add_state=await manager_db.add_new_user(user_opject)
				if(add_state.result){return true}else{return {err:true}}
			}else{return true}			
		}catch(err){return {err:true}}
	}

	set_log_in_cookie(res,email){
	    var options = {
	        maxAge: 10000 * 60 * 15, // would expire after 15 minutes
	        httpOnly: true // The cookie only accessible by the web server
	    }
	    var outh_object={
	    	log_in_state: true,
	    	email:email
	    }
	    var token = jwt.sign(outh_object, 'shhhhh');
	    res.cookie('outh_token', token, options) 
	}

	set_log_out_cookie(res){
	    var options = {
	        maxAge: 10000 * 60 * 15, // would expire after 15 minutes
	        httpOnly: true // The cookie only accessible by the web server
	    }
	    var outh_object={
	    	log_in_state: false,
	    }
	    var token = jwt.sign(outh_object, 'shhhhh');
	    res.cookie('outh_token', token, options) 
	}			

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_users
