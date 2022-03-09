class Manager_Dashboard{
	constructor(props) {
		this.start()
	}

	async start(){
		this.load_componants()
		this.handel_requstes()
	}

	handel_requstes(){
		global.http_server.get('/dashboard',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req);
			if(!cookie_validate_state['state']){res.redirect('/'); return}
			var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
			if(!log_in_state){res.redirect('/'); return}
			res.sendFile(path.join(__dirname, 'app/dashboard/index.html'))
		})	

		global.http_server.post('/dashboard/get_account_data',async(req,res)=>{
			try{
				var cookie_validate_state=this.check_requset_cookie_validat(req);
				if(!cookie_validate_state['state']){return res.end()}
				var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
				if(!log_in_state){return res.end()}
				var email=await this.get_user_email_from_req(req)
				if(!email){return res.end()}
				var get_user_qurye=await global.manager_db.get_user_by_email(email)
				if(get_user_qurye.err){return res.end()}
				if(get_user_qurye.result==null){return res.end()}
				var user=get_user_qurye.result;
				var order_list=this.convert_server_order_list_to_user_order_list(user['order_list'])
				var account_data={
					email:user['email'],
					username:user['username'],
					picture:user['picture'],
					palance:user['palance'],
					order_list:order_list,
					download_list:user['download_list']
				}
				console.log(account_data)
				res.json(account_data)
			}catch(err){
				return res.end()
			}
		})		
	}

	convert_server_order_list_to_user_order_list(server_order_list){
		var user_order_list=[];
		for(var server_order_row of server_order_list){
			console.log(server_order_row)
			var user_order_row={
				id:server_order_row['id'],
				total:`${server_order_row['total']} ${server_order_row['currency']}`,
				paid_at:server_order_row['paid_at'],
				payment_method:server_order_row['invoice_transactions'][0]['payment_method'],
				status:server_order_row['invoice_transactions'][0]['status'],
				refrence_id:server_order_row['invoice_transactions'][0]['refrence_id']
			}
			user_order_list.push(user_order_row)
		}
		return user_order_list
	}

	check_requset_cookie_validat(req){
		if(!req.cookies){return {state:false}}
		if(!req.cookies['outh_token']){return {state:false}}
		return {state:true}
	}

	get_user_email_from_req(req){
		try{
			var decode=jwt.verify(req.cookies['outh_token'], 'shhhhh');
			return decode['email']
		}catch(err){
			return false
		}	
	}	

	check_user_log_in_state(outh_token){
		try{
			var decode=jwt.verify(outh_token, 'shhhhh');
			return decode['log_in_state']
		}catch(err){
			return false
		}	
	}

	load_componants(){
		this.account = require('./componants/account.js');
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_Dashboard
