class Manager_Pay{
	constructor(props) {
		this.invoices_in_sucssess_prossess={};
		this.invoices_in_fail_prossess={};
		this.start()
	}

	async start(){
		this.handel_requstes()
	}	

	handel_requstes(){
		global.http_server
		.post('/pay/get_payment_url',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req)
			if(!cookie_validate_state){res.end(); return;}
			var user_log_in_state=this.check_user_log_in_state(req.cookies['outh_token'])
			if(!user_log_in_state){res.end(); return;}
			var requst_payment_object=this.get_payment_object_from_req(req)
			if(!requst_payment_object){res.end(); return;}
			var paygate_payment_object=await this.get_payment_object_from_paygate(req,requst_payment_object)
			if(!paygate_payment_object){res.end(); return;}
			var reqord_invoice_state=await this.reqord_invoice_id(paygate_payment_object)
			if(!reqord_invoice_state){res.end(); return;}
			res.json(paygate_payment_object)
		})

		global.http_server
		.get('/pay/sucssess/',async(req,res)=>{
			try{
				if(!req.query['invoice_id']){return res.end()}
				var in_sucsess_process_state=this.cheek_if_invoice_id_in_sucsess_process(req.query['invoice_id'])
				if(in_sucsess_process_state){return res.end()}
				
				this.add_invoice_id_to_in_sucssess_process(req.query['invoice_id'])
				var trascation_data=await this.get_trascation_data_by_invoice_id_from_payment_gat(req.query['invoice_id'])
				if(!trascation_data){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ; return res.end()}

				var invoice_object_qurey=await global.manager_db.get_invoice_from_waiting_invoice_by_id(trascation_data['id'])
				if(invoice_object_qurey.err){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ;return res.end()}
				if(invoice_object_qurey.result==null){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ;return res.end()}

				switch (trascation_data['invoice_transactions'][0]['status']) {
					case 'success':
						var add_palance_and_order_list_row_to_user_state=await this.add_palance_and_order_list_row_to_user(invoice_object_qurey.result,trascation_data)
						if(!add_palance_and_order_list_row_to_user_state){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ;return res.end()}

						var remove_invoice_from_waiting_invoice_by_id_qury=await global.manager_db.remove_invoice_from_waiting_invoice_by_id(trascation_data['id'])
						if(remove_invoice_from_waiting_invoice_by_id_qury.err){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ;return res.end()}
						this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id'])
						res.redirect('/dashboard/#viow=Account')
						break;
					case 'pending':
						var add_palance_and_order_list_row_to_user_state=await this.add_order_list_row_to_user(invoice_object_qurey.result,trascation_data)
						if(!add_palance_and_order_list_row_to_user_state){this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id']) ;return res.end()}
						this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id'])
						res.redirect('/dashboard/#viow=Account')
						break;					

				}

			}catch(err){
				console.log(err)
				this.remove_invoice_id_from_in_sucssess_process(req.query['invoice_id'])
				res.end()
			}
		})

		global.http_server
		.get('/pay/fail/',async(req,res)=>{
			try{
				if(!req.query['invoice_id']){return res.end()}
				var in_sucsess_process_state=this.cheek_if_invoice_id_in_fail_process(req.query['invoice_id'])
				if(in_sucsess_process_state){return res.end()}

				this.add_invoice_id_to_in_fail_process(req.query['invoice_id'])
				var trascation_data=await this.get_trascation_data_by_invoice_id_from_payment_gat(req.query['invoice_id'])
				if(!trascation_data){this.remove_invoice_id_from_in_fail_process(req.query['invoice_id']) ; return res.end()}

				var invoice_object_qurey=await global.manager_db.get_invoice_from_waiting_invoice_by_id(trascation_data['id'])
				if(invoice_object_qurey.err){this.remove_invoice_id_from_in_fail_process(req.query['invoice_id']) ;return res.end()}
				if(invoice_object_qurey.result==null){this.remove_invoice_id_from_in_fail_process(req.query['invoice_id']) ;return res.end()}

				var add_palance_and_order_list_row_to_user_state=await this.add_order_list_row_to_user(invoice_object_qurey.result,trascation_data)
				if(!add_palance_and_order_list_row_to_user_state){this.remove_invoice_id_from_in_fail_process(req.query['invoice_id']) ;return res.end()}				

				var remove_invoice_from_waiting_invoice_by_id_qury=await global.manager_db.remove_invoice_from_waiting_invoice_by_id(trascation_data['id'])
				if(remove_invoice_from_waiting_invoice_by_id_qury.err){this.remove_invoice_id_from_in_fail_process(req.query['invoice_id']) ; return res.end()}
				this.remove_invoice_id_from_in_fail_process(req.query['invoice_id'])
				
				res.redirect('/dashboard/#viow=Account')
			}catch(err){
				console.log(err)
				res.end()
			}
		})

		global.http_server
		.post('/pay/payed/:id',async(req,res)=>{
			console.log('/pay/payed','post')
		})	

		global.http_server
		.get('/pay/payed/:id',async(req,res)=>{
			console.log('/pay/payed','get')
		})					
	}


	async add_palance_and_order_list_row_to_user(invoice_object,trascation_data){
		var email=invoice_object.user_email;
		var total=trascation_data.total;
		var order_list_row=trascation_data;
		var get_user_qurey=await global.manager_db.get_user_by_email(email);
		if(get_user_qurey.err){return false}
		if(get_user_qurey.result==null){return false}
		var user=get_user_qurey.result;
		user.palance+=(+total);
		user.order_list.push(order_list_row);
		var update_user_qurey=await global.manager_db.update_user_by_email(email,user)
		if(update_user_qurey.err){return false}
		if(update_user_qurey.result==null){return false}
		return true;
	}

	async add_order_list_row_to_user(invoice_object,trascation_data){
		var email=invoice_object.user_email;
		var order_list_row=trascation_data;

		var get_user_qurey=await global.manager_db.get_user_by_email(email);
		if(get_user_qurey.err){return false}
		if(get_user_qurey.result==null){return false}

		var user=get_user_qurey.result;
		user.order_list.push(order_list_row);

		var update_user_qurey=await global.manager_db.update_user_by_email(email,user)
		if(update_user_qurey.err){return false}
		if(update_user_qurey.result==null){return false}

		return true;
	}

	cheek_if_invoice_id_in_sucsess_process(invoice_id){
		if(invoice_id in this.invoices_in_sucssess_prossess){
			return true
		}
		return false;
	}
	add_invoice_id_to_in_sucssess_process(invoice_id){
		this.invoices_in_sucssess_prossess[invoice_id]=true
	}
	remove_invoice_id_from_in_sucssess_process(invoice_id){
		delete this.invoices_in_sucssess_prossess[invoice_id]
	}

	cheek_if_invoice_id_in_fail_process(invoice_id){
		if(invoice_id in this.invoices_in_fail_prossess){
			return true
		}
		return false;
	}
	add_invoice_id_to_in_fail_process(invoice_id){
		this.invoices_in_fail_prossess[invoice_id]=true
	}
	remove_invoice_id_from_in_fail_process(invoice_id){
		delete this.invoices_in_fail_prossess[invoice_id]
	}

	async get_trascation_data_by_invoice_id_from_payment_gat(invoice_id){
		try{
			const meta = [['Content-Type', 'application/json'], ['Authorization', 'Bearer 108b43ac430d080a6faabbb987f2054b4033c04fa202159cfc']];
			const headers = new Headers(meta);		
	 		const response = await fetch(
		 			`https://fawaterkstage.com/api/v2/getInvoiceData/${invoice_id}`,{
					headers:headers,
					method: 'get'  
				}
			);
			if(!response.status==200){return false}
			var data = await response.json()
			return data.data
		}catch(err){
			return false
		}					
	}

	get_payment_object_from_req(req){
		try{
			if(!req['body']){return false}
			if(!req['body']['payment_object']){return false}
			if(!req['body']['payment_object']['plane_name']){return false}
			return req['body']['payment_object']
		}catch(err){
			return false
		}
		
	}

	async get_payment_object_from_paygate(req,requst_payment_object){
		try{
			var user_email=this.get_user_email_from_req(req)
			if(!user_email){return false}
			var {plane_name}=requst_payment_object;
			var plane_price=this.get_plane_price_by_plane_name(plane_name)
			if(!plane_price){return false}
			var bayment_object={
			    "cartTotal": `${plane_price}`,
			    "currency": "EGP",
			    "customer": {
			        "first_name": `${user_email}`,
			        "last_name": "--------",
			        "email": `${user_email}`,
			        "phone": "-----------",
			        "address": "--------"
			    },
			    "redirectionUrls": {
			         "successUrl" : "https://dev.fawaterk.com/success",
			         "failUrl": "https://dev.fawaterk.com/fail",
			         "pendingUrl": "https://dev.fawaterk.com/pending"   
			    },
			    "cartItems": [
			        {
			            "name": `Graficy ${plane_name} plane`,
			            "price": `${plane_price}`,
			            "quantity": "1"
			        }
			    ]
			}
			const meta = [['Content-Type', 'application/json'], ['Authorization', 'Bearer 108b43ac430d080a6faabbb987f2054b4033c04fa202159cfc']];
			const headers = new Headers(meta);		
	 		const response = await fetch(
		 			`http://fawaterkstage.com/api/v2/createInvoiceLink`,{
					method: 'POST',  
					headers:headers,			       
					body: JSON.stringify(bayment_object)
				}
			);
			if(!response.status==200){return false}
			var data = await response.json()
			if(data.status!='success'){return false}
			data.data['user_email']=user_email;
			return data.data					
		}catch(err){
			return false
		}
	}

	async reqord_invoice_id(payment_object){
		try{
			var invoice_object={
				invoice_id:payment_object['invoiceId'],
				user_email:payment_object['user_email']
			}
			var reqourd_state=global.manager_db.add_invoice_to_waiting_invoice_if_not_exest(invoice_object)
			if(reqourd_state.err){return false}
			return true;
		}catch(err){
			console.log(err)
		}
	}

	get_plane_price_by_plane_name(plane_name){
		for(var price_row of global.MM.subscrip_plans){
			if(price_row.name.toUpperCase()==plane_name.toUpperCase()){
				return price_row.price;
				break
			}
		}
		return false;
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
		

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_Pay
