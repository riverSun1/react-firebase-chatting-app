import React, { Component } from "react";
import { FaRegSmileBeam } from "react-icons/fa";
import firebase from "../../../firebase";
import { connect } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoom_action";

export class Favorited extends Component {
  state = {
    favoritedChatRoom: [],
    usersRef: firebase.database().ref("users"),
    activeChatRoomId: "",
  };

  componentDidMount() {
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if (this.props.user) {
      this.removeListeners(this.props.user.uid);
    }
  }

  removeListeners = (userId) => {
    this.state.usersRef.child(`${userId}/favorited`).off();
  };

  addListeners = (userId) => {
    const { usersRef } = this.state;

    usersRef
      .child(userId)
      .child("favorited")
      .on("child_added", (DataSnapshot) => {
        const favoritedChatRoom = {
          id: DataSnapshot.key,
          ...DataSnapshot.val(),
        };
        this.setState({
          favoritedChatRoom: [
            ...this.state.favoritedChatRoom,
            favoritedChatRoom,
          ],
        });
      });

    usersRef
      .child(userId)
      .child("favorited")
      .on("child_removed", (DataSnapshot) => {
        const chatRoomToRemove = {
          id: DataSnapshot.key,
          ...DataSnapshot.val(),
        };
        const filteredChatRooms = this.state.favoritedChatRoom.filter(
          (chatRoom) => {
            return chatRoom.id !== chatRoomToRemove.id;
          }
        );
        this.setState({ favoritedChatRoom: filteredChatRooms });
      });
  };

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room)); // 클릭한 채팅룸 리덕스 스토어에 넣어줌
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
  };

  renderFavoritedChatRooms = (favoritedChatRoom) =>
    favoritedChatRoom.length > 0 &&
    favoritedChatRoom.map((chatRoom) => (
      <li
        key={chatRoom.id}
        onClick={() => this.changeChatRoom(chatRoom)}
        style={{
          backgroundColor:
            chatRoom.id === this.state.activeChatRoomId && "#ffffff45",
        }}
      >
        # {chatRoom.name}
      </li>
    ));

  render() {
    const { favoritedChatRoom } = this.state;
    return (
      <div>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegSmileBeam style={{ marginRight: "3px" }} />
          FAVORITED ({favoritedChatRoom.length})
        </span>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {this.renderFavoritedChatRooms(favoritedChatRoom)}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(Favorited);
