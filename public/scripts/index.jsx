var React = require('react');
var ajax = require('ajax');
var $ = require('jquery');
var ReactDOM = require('react-dom');
var Paper = require('material-ui/lib/paper');
var AppBar = require('material-ui/lib/app-bar');
var TextField = require('material-ui/lib/text-field');
var Tabs = require('material-ui/lib/tabs/tabs')
var Tab = require('material-ui/lib/tabs/tab')
var Table = require('reactable').Table;
var Td = require('reactable').Td;
var Tr = require('reactable').Tr;
var List = require('material-ui/lib/lists/list');
var ListItem = require('material-ui/lib/lists/list-item');
var LeftNav = require('material-ui/lib/left-nav');
var FlatButton = require('material-ui/lib/flat-button');
var Color = require('material-ui/lib/styles/colors');
var randkey = require('random-key');
var LinearProgress = require('material-ui/lib/linear-progress');

list = [ '' ]
needed = []
queue = []
closeQueueStyle = {

}
var App = React.createClass({
	refreshQueue: function(){
			$.ajax({
				url: '/queue',
				dataType: 'json',
				success: function(data){	
					queue = data
					delete queue["__header"]
					}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function(){
		return {
			data : [ '' ], 
			queue : [ '' ],
			queueOpen : false
		}
	},
	componentDidMount: function(){
		this.refreshQueue()
		setInterval(this.refreshQueue, 6000)
	},
	requestAmazon: function(input) {
		$.ajax({
			url: '/data',
			dataType: 'json',
			type: 'POST',
			data: {"keyword" : input.toString()},
			success: function (data) {
				list.splice(0,1)
				list.push(data)
				console.log(list)
				this.setState({
					data: $.makeArray(list)
				});	
			}.bind(this), 
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	toggleQueue: function() {
		this.refreshQueue()
		this.setState({
			queueOpen: !this.state.queueOpen
		})
	},
	render: function() { 
		return (
			<Paper className="paperE" zDepth={5}>
				<AppBar 
					showMenuIconButton={false}
					title="Amazon Comprehensive Market Analysys"
				>
				<FlatButton primary={true} label='Queue' onClick={this.toggleQueue}/>
				</AppBar>
				<div id="searchFieldContainer">
					<SearchField onEnter={this.requestAmazon}/>
				</div>
				<LeftNav open={this.state.queueOpen} openRight={true}>
					<FlatButton primary={true} label='Close' onClick={this.toggleQueue}/>
					<RequestQueue onClick={this.requestAmazon}/>
				</LeftNav>
				<ItemTable/>
			</Paper>
		);
	}
});

var SearchField = React.createClass({
	getInitialState: function(){
		return {
			text: ''
		}
	},
	handleInput: function() {
		this.props.onEnter(this.state.text)
	},
	handleChange: function(e){
		this.setState({
			text: e.target.value
		})
	},
	render: function() {
		return (
			<div class = 'sf'>
			<TextField fullWidth={true} onChange={this.handleChange}/>
			<FlatButton label = 'Collect Data' onClick={this.handleInput}/>
			</div>
		)
	}
});

var ItemTable = React.createClass({
	getInitialState: function(){
		return {
			data: []
		}
	},
	componentDidMount: function(){
	},
	render: function() {
			products = Object.keys(list[0]).map( function(k, i, keys) {
				return (
					<Tr key = {randkey.generate(7)}>
					<Td column="Key Phrase" data = {k}/>
					<Td column="Total Results" data={parseInt(list[0][k].TotalResults)}/>
					<Td column="Most Items in Category" data={list[0][k].MostCommonIndex}/>
					<Td column="Highest Sales Rank" data={parseInt(list[0][k].HighestSalesRank)}/>
					<Td column="Highest Sales Rank in Category" data={list[0][k].BestSellingIndex}/>
					</Tr>
				);
			});
		return(
			<Table className="table" sortable={true}>
	 		{products}
			</Table>
		)
	}
});

var RequestQueue = React.createClass({
	handleClick: function(e){
		console.log(e)
		this.props.onClick(e.target.textContent)
	},
	render: function(){
		var requests = Object.keys(queue).map(function(k, i, keys){
			if(queue[k].status == 'cached'){
				return (
					<ListItem primaryText={k} key={randkey.generate(7)} onClick={this.handleClick} style={{backgroundColor : Color.green300}}/>
				)
			}
			if(queue[k].status == 'processing'){
								return (
					<ListItem primaryText={k} key={randkey.generate(7)} onClick={this.handleClick} style={{backgroundColor : Color.lime300}}>
					<LinearProgress mode="determinate" value={queue[k].progress} min={0} max={280}/>
					</ListItem>
				)
			}	
			if(queue[k].status == 'scheduled'){
								return (
					<ListItem primaryText={k} key={randkey.generate(7)} onClick={this.handleClick} style={{backgroundColor : Color.deepOrange300}}>
					</ListItem>
				)
			}	

		}, this);
		return(
			<List>
			 {requests}
			</List>
		)
	}	
});

ReactDOM.render(
	<App/>,
		document.getElementById('content')
);
