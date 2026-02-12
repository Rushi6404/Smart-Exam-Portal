import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import SidebarUser from "../../components/SidebarUser";
import axios from "axios";
import "./UserProfilePage.css";
import { fetchCategories } from "../../actions/categoriesActions";
import { fetchQuizzes } from "../../actions/quizzesActions";
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaIdBadge } from "react-icons/fa";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginReducer = useSelector((state) => state.loginReducer);
  const [user, setUser] = useState(loginReducer.user);
  const token = JSON.parse(localStorage.getItem("jwtToken"));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories(dispatch, token);
    fetchQuizzes(dispatch, token);
  }, [dispatch]);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
    if (loginReducer.user) {
      setUser(loginReducer.user);
    }
  }, [loginReducer.user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const response = await axios.post(`/api/user/upload-profile-image/${user.userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      // alert("Profile Image Updated Successfully!"); 
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (user && user.profileImage) {
      return `/user-photos/${user.profileImage}`;
    }
    return "images/user.png";
  };

  return (
    <div className="userProfilePage__container">
      <div className="userProfilePage__sidebar">
        <SidebarUser />
      </div>
      <div className="userProfilePage__content">
        <Container fluid className="p-4">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="glass-card profile-card border-0 shadow-lg">
                <Card.Body className="text-center">
                  <div className="profile-image-container mb-4">
                    <Image
                      className="profile-pic shadow"
                      src={getProfileImageUrl()}
                      onError={(e) => { e.target.onerror = null; e.target.src = "images/user.png" }}
                      roundedCircle
                      width="150"
                      height="150"
                    />
                    <Form.Label htmlFor="profile-upload" className="upload-icon-overlay">
                      {uploading ? <Spinner animation="border" size="sm" variant="light" /> : <FaCamera className="text-white" />}
                    </Form.Label>
                    <Form.Control
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </div>

                  <h2 className="fw-bold mb-1">{user.firstName} {user.lastName}</h2>
                  <p className="text-muted mb-3">
                    <Badge bg="info" className="me-2">{user.roles && user.roles[0] ? user.roles[0].roleName : "User"}</Badge>
                    <span className={user.enabled ? "text-success" : "text-danger"}>
                      {user.enabled ? "Active" : "Inactive"}
                    </span>
                  </p>

                  <div className="profile-details text-start mt-4 p-3 rounded bg-light-transparent">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-box me-3 text-primary"><FaIdBadge size={20} /></div>
                      <div>
                        <small className="text-muted d-block">Username</small>
                        <span className="fw-medium">{user.username}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-box me-3 text-primary"><FaEnvelope size={20} /></div>
                      <div>
                        <small className="text-muted d-block">Email</small>
                        <span className="fw-medium">{user.email || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="icon-box me-3 text-primary"><FaPhone size={20} /></div>
                      <div>
                        <small className="text-muted d-block">Phone Number</small>
                        <span className="fw-medium">{user.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default UserProfilePage;
