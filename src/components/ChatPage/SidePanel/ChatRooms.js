import React, { Component } from "react";
import { FaRegSmileWink } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { Modal, Button, Badge, Form } from "react-bootstrap";
import { connect } from "react-redux";
import firebase from "../../../firebase";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoom_action";

export class ChatRooms extends Component {
  state = {
    show: false,
    name: "",
    description: "",
    chatRoomsRef: firebase.database().ref("chatRooms"),
    messagesRef: firebase.database().ref("messages"),
    chatRooms: [],
    firstLoad: true,
    activeChatRoomId: "",
    notifications: [],
  };

  componentDidMount() {
    this.AddChatRoomsListeners();
  }

  componentWillUnmount() {
    this.state.chatRoomsRef.off(); // clean up event listener

    this.state.chatRooms.forEach((chatRoom) => {
      this.state.messagesRef.child(chatRoom.id).off();
    });
  }

  setFirstChatRoom = () => {
    const firstChatRoom = this.state.chatRooms[0];
    if (this.state.firstLoad && this.state.chatRooms.length > 0) {
      this.props.dispatch(setCurrentChatRoom(firstChatRoom)); // 처음 로드될때 임의로 첫 번째 룸을 현재 룸으로 지정
      this.setState({ activeChatRoomId: firstChatRoom.id });
    }
    this.setState({ firstLoad: false });
  };

  AddChatRoomsListeners = () => {
    // 방이 새로 추가될 때마다 모든 pc에서 실시간으로 반영됨 (listener 이용)
    let chatRoomsArray = [];

    this.state.chatRoomsRef.on("child_added", (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      this.setState({ chatRooms: chatRoomsArray }, () =>
        this.setFirstChatRoom()
      );
      this.addNotificationListener(DataSnapshot.key);
    });
  };

  addNotificationListener = (chatRoomId) => {
    this.state.messagesRef.child(chatRoomId).on("value", (DataSnapshot) => {
      if (this.props.chatRoom) {
        this.handleNotification(
          chatRoomId,
          this.props.chatRoom.id,
          this.state.notifications,
          DataSnapshot
        );
      }
    });
  };

  handleNotification = (
    chatRoomId,
    currentChatRoomId,
    notifications,
    Datasnapshot
  ) => {
    // 이미 notifications state 안에 알림 정보가 들어있는 채팅방과 그렇지 않은 채팅방을 나눠주기
    let index = notifications.findIndex(
      (notification) => notification.id === chatRoomId
    );

    // notifications state 안에 해당 채팅방의 알림 정보가 없을 때
    let lastTotal = 0;
    if (index === -1) {
      notifications.push({
        id: chatRoomId,
        total: Datasnapshot.numChildren(),
        lastKnownTotal: Datasnapshot.numChildren(),
        count: 0,
      });
    }
    // 이미 해당 채팅방의 알림 정보가 있을 때
    else {
      // 상대방이 채팅을 보내는 그 해당 채팅방에 있지 않을 때
      if (chatRoomId !== currentChatRoomId) {
        // 현재까지 유저가 확인한 총 메시지 개수
        lastTotal = notifications[index].lastKnownTotal;

        // count (알림으로 보여줄 숫자)를 구하기
        // 현재 총 메시지 개수 - 이전에 확인한 총 메시지 개수 > 0
        // 현재 총 메시지 개수가 10개이고 이전에 확인한 메시지가 8개 였다면 2개를 알림으로 보여줘야함
        if (Datasnapshot.numChildren() - lastTotal > 0) {
          notifications[index].count = Datasnapshot.numChildren() - lastTotal;
        }
      }
      // total property에 현재 전체 메시지 개수를 넣어주기
      notifications[index].total = Datasnapshot.numChildren();
    }
    this.setState({ notifications });
  };

  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });

  handleSubmit = (e) => {
    e.preventDefault();

    const { name, description } = this.state;

    if (this.isFormValid(name, description)) {
      this.addChatRoom();
    }
  };

  addChatRoom = async () => {
    const key = this.state.chatRoomsRef.push().key;
    const { name, description } = this.state;
    const { user } = this.props;
    const newChatRoom = {
      id: key,
      name: name,
      description: description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL,
      },
    };

    try {
      await this.state.chatRoomsRef.child(key).update(newChatRoom);
      this.setState({
        name: "",
        description: "",
        show: false,
      });
    } catch (error) {
      alert(error);
    }
  };

  isFormValid = (name, description) => name && description;

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room)); // 클릭한 채팅룸 리덕스 스토어에 넣어줌
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
    this.clearNotifications();
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.props.chatRoom.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].lastKnownTotal =
        this.state.notifications[index].total;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  getNotificationCount = (room) => {
    // 해당 채팅방의 count 수 구하기
    let count = 0;

    this.state.notifications.forEach((notification) => {
      if (notification.id === room.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    chatRooms.map((room) => (
      <li
        key={room.id}
        style={{
          backgroundColor:
            room.id === this.state.activeChatRoomId && "#ffffff45",
        }}
        onClick={() => this.changeChatRoom(room)}
      >
        # {room.name}
        <Badge style={{ float: "right" }} bg="danger">
          {this.getNotificationCount(room)}
        </Badge>
      </li>
    ));

  render() {
    return (
      <div>
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaRegSmileWink style={{ marginRight: 3 }} />
          CHAT ROOMS (1)
          <FaPlus
            style={{ position: "absolute", right: 0, cursor: "pointer" }}
            onClick={this.handleShow}
          />
        </div>

        {/* CHAT ROOMS LIST */}

        <ul style={{ listStyleType: "none", padding: 0 }}>
          {this.renderChatRooms(this.state.chatRooms)}
        </ul>

        {/* ADD CHAT ROOM MODAL */}

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create a chat room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>방 이름</Form.Label>
                <Form.Control
                  onChange={(e) => this.setState({ name: e.target.value })}
                  type="text"
                  placeholder="Enter a chat room name"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>방 설명</Form.Label>
                <Form.Control
                  onChange={(e) =>
                    this.setState({ description: e.target.value })
                  }
                  type="text"
                  placeholder="Enter a chat room description"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom,
  };
};

export default connect(mapStateToProps)(ChatRooms);
