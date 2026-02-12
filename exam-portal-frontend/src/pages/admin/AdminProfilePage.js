import React, { useEffect } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./AdminProfilePage.css";
import Image from "react-bootstrap/Image";
import { fetchCategories } from "../../actions/categoriesActions";
import { fetchQuizzes } from "../../actions/quizzesActions";
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaToggleOn } from "react-icons/fa";

const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginReducer = useSelector((state) => state.loginReducer);
  const user = loginReducer.user;
  const token = JSON.parse(localStorage.getItem("jwtToken"));

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  useEffect(() => {
    fetchCategories(dispatch, token);
    fetchQuizzes(dispatch, token);
  }, [dispatch]);

  return (
    <div className="adminProfilePage__container">
      <div className="adminProfilePage__sidebar">
        <Sidebar />
      </div>
      <div className="adminProfilePage__content">
        <Container fluid className="p-4">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="glass-card profile-card border-0 shadow-lg">
                <Card.Body className="text-center">
                  <div className="profile-image-container mb-4">
                    <Image
                      className="profile-pic shadow"
                      src="images/user.png"
                      roundedCircle
                      width="150"
                      height="150"
                    />
                  </div>

                  <h2 className="fw-bold mb-1">{user.firstName} {user.lastName}</h2>
                  <p className="text-muted mb-3">
                    <Badge bg="success" className="me-2">{user.roles[0].roleName}</Badge>
                    <span className={user.active ? "text-success" : "text-danger"}>
                      {user.active ? "Active" : "Inactive"}
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
                        <span className="fw-medium">{user.email}</span>
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

export default AdminProfilePage;
