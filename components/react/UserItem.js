import * as React from "react";

export default class UserItem extends React.Component {
  handleClick = () => {
    this.props.onSelect(this.props.user);
  }

  render() {
    const className = this.props.selected ? "user selected" : "user";
    return this.props.user ? (
      <div className={className}>
        <span>Id: {this.props.user.id}</span> -{" "}
        <span>{this.props.user.name}</span>
        <button onClick={this.handleClick} disabled={this.props.selected}>
          select
        </button>
      </div>
    ) : null;
  }
}
