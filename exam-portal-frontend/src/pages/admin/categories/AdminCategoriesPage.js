import React, { useEffect, useState } from "react";
import "./AdminCategoriesPage.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Row, Col, Card } from "react-bootstrap";
import * as categoriesConstants from "../../../constants/categoriesConstants";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";
import Sidebar from "../../../components/Sidebar";
import {
  deleteCategory,
  fetchCategories,
} from "../../../actions/categoriesActions";
import swal from "sweetalert";
import { FaEdit, FaTrash, FaPlus, FaLayerGroup } from "react-icons/fa";

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = JSON.parse(localStorage.getItem("jwtToken"));

  const categoriesReducer = useSelector((state) => state.categoriesReducer);
  const [categories, setCategories] = useState(categoriesReducer.categories);

  const categoryClickHandler = (catId) => {
    navigate(`/adminQuizzes/?catId=${catId}`);
  };

  const addNewCategoryHandler = () => {
    navigate("/adminAddCategory");
  };

  const updateCategoryHandler = (event, category) => {
    event.stopPropagation();
    navigate(`/adminUpdateCategory/${category.catId}/`);
  };

  const deleteCategoryHandler = (event, category) => {
    event.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this category!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteCategory(dispatch, category.catId, token).then((data) => {
          if (data.type === categoriesConstants.DELETE_CATEGORY_SUCCESS) {
            swal(
              "Category Deleted!",
              `${category.title} succesfully deleted`,
              "success"
            );
          } else {
            swal(
              "Category Not Deleted!",
              `${category.title} not deleted`,
              "error"
            );
          }
        });
      } else {
        swal(`${category.title} is safe`);
      }
    });
  };

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories(dispatch, token).then((data) => {
        setCategories(data.payload);
      });
    }
  }, []);

  return (
    <div className="adminCategoriesPage__container">
      <div className="adminCategoriesPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminCategoriesPage__content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold"><FaLayerGroup className="me-2" />Categories</h2>
          <Button
            className="btn-primary d-flex align-items-center shadow-sm"
            onClick={addNewCategoryHandler}
          >
            <FaPlus className="me-1" /> Add Category
          </Button>
        </div>

        {categories ? (
          categories.length === 0 ? (
            <Message>
              No categories are present. Try adding some categories.
            </Message>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {categories.map((cat, index) => (
                <Col key={index}>
                  <Card
                    className="category-card h-100 shadow-sm border-0"
                    onClick={() => categoryClickHandler(cat.catId)}
                  >
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold text-primary">{cat.title}</Card.Title>
                      <Card.Text className="text-muted flex-grow-1">
                        {cat.description}
                      </Card.Text>
                      <div className="d-flex justify-content-end mt-3 border-top pt-3">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2 d-flex align-items-center"
                          onClick={(e) => updateCategoryHandler(e, cat)}
                        >
                          <FaEdit className="me-1" /> Update
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="d-flex align-items-center"
                          onClick={(e) => deleteCategoryHandler(e, cat)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
