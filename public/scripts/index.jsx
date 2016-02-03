var React = require('react');
var ajax = require('ajax');
var $ = require('jquery');
var ReactDOM = require('react-dom');
var Paper = require('material-ui/lib/paper');
var AppBar = require('material-ui/lib/app-bar');
var TextField = require('material-ui/lib/text-field');
var Table = require('reactable').Table;
var Td = require('reactable').Td;
var Tr = require('reactable').Tr;


var App = React.createClass({
	getFreshData: function(){
		$.ajax({
			url: '/data',
			dataType: 'json',
			success: function(data){
				this.setState({
					data: $.makeArray(data)
				});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		})
	},
	getInitialState: function(){
		return {
			data : [ '' ] 
		}

	},
	componentDidMount: function(){
		this.getFreshData
		setInterval(this.getFreshData, 5000)
	},
	requestAmazon: function(input) {
		$.ajax({
			url: '/data',
			dataType: 'json',
			type: 'POST',
			data: {"keyword" : input.toString()},
			success: function (data) {
				this.setState({
					data: $.makeArray(data)
				})	
			}.bind(this), 
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() { 
		return (
			<Paper className="paperE" zDepth={5}>
				<AppBar 
					showMenuIconButton={false}
					title="Amazon Comprehensive Market Analysys"
				/>
				<div id="searchFieldContainer">
					<SearchField onEnter={this.requestAmazon}/>
				</div>
				<ItemTable data={this.state.data}/>
			</Paper>
		);
	}
});

var SearchField = React.createClass({
	handleInput: function(e) {
		this.props.onEnter(e.target.value)
	},
	render: function() {
		return (
			<TextField fullWidth={true} onEnterKeyDown={this.handleInput}/>
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
			var products = Object.keys(this.props.data[0]).map( function(k, i, keys) {
				console.log(this.props.data[0][k])
				return (
					<Tr key = {Date.now()}>
					<Td column="Key Phrase" data = {k}/>
					<Td column="Total Results" data={this.props.data[0][k].TotalResults}/>
					<Td column="Most Items in Category" data={this.props.data[0][k].MostCommonIndex}/>
					<Td column="Highest Sales Rank" data={this.props.data[0][k].HighestSalesRank}/>
					</Tr>
				);

			}, this);
		return(
			<Table className="table">
			{products}
			</Table>
		)
	}
});

ReactDOM.render(
	<App/>,
		document.getElementById('content')
);
