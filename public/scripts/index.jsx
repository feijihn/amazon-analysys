var React = require('react');
var ajax = require('ajax');
var $ = require('jquery');
var ReactDOM = require('react-dom');
var Paper = require('material-ui/lib/paper');
var Colors = require('material-ui/lib/styles/colors');
var AppBar = require('material-ui/lib/app-bar');
var TextField = require('material-ui/lib/text-field');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var IconButton = require('material-ui/lib/icon-button');
var MenuItem = require('material-ui/lib/menus/menu-item');
var Divider = require('material-ui/lib/divider');
var IconMenu = require('material-ui/lib/menus/icon-menu');
var DropDownMenu = require('material-ui/lib/DropDownMenu');

var App = React.createClass({
	requestAmazon: function(input) {
		$.ajax({
			url: '/data',
			dataType: 'json',
			type: 'POST',
			data: {"keyword" : input.toString()},
			success: function (data) {
				
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
})

ReactDOM.render(
	<App/>,
		document.getElementById('content')
);
