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
	getInitialState: function(){
		return {
			data: ['1','2']
		}
	},
	requestAmazon: function(input) {
		$.ajax({
			url: '/data',
			dataType: 'json',
			type: 'POST',
			data: {"keyword" : input.toString()},
			success: function (data) {
				this.setState({
					data: data
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
			var products = this.props.data.map(function(el, i, data) {
				return (
					<Tr>
					<Td column="Product" data={data[i]} key={Date.now()}/>
					</Tr>
				);

			});
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
