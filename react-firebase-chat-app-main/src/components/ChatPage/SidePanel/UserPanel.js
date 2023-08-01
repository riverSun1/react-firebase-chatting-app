import React, { useRef } from "react";
import { IoIosChatboxes } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import firebase from "../../../firebase";
import { setPhotoURL } from "../../../redux/actions/user_action";

function UserPanel() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const inputOpenImageRef = useRef();

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const metadata = file.type; // mime-types 라이브러리 이용도 가능

    try {
      // 스토리지에 파일 저장하기
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref()
        .child(`user_image/${user.uid}`)
        .put(file, metadata);

      let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

      // 프로필 이미지 수정
      await firebase.auth().currentUser.updateProfile({
        photoURL: downloadURL,
      });
      // 바뀐 이미지로 보여주기
      dispatch(setPhotoURL(downloadURL));

      // 데이터베이스 유저 이미지 수정
      await firebase
        .database()
        .ref("users")
        .child(user.uid)
        .update({ image: downloadURL });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* Logo */}
      <h3 style={{ color: "white" }}>
        <IoIosChatboxes /> Chat App
      </h3>

      {/* User Dropdown */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <Image
          src={user && user.photoURL}
          style={{ width: "30px", height: "30px", marginTop: "3px" }}
          roundCircle
        />
        <Dropdown>
          <Dropdown.Toggle
            style={{ background: "transparent", border: "0px" }}
            id="dropdown-basic"
          >
            {user && user.displayName}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleOpenImageRef}>
              프로필 사진 변경
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <input
          onChange={handleUploadImage}
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
          ref={inputOpenImageRef}
          type="file"
        />
      </div>
    </div>
  );
}

export default UserPanel;
