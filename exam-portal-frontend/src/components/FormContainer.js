import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

const FormContainer = ({ children }) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <div className="card p-4 shadow-card border-0 rounded-3">
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default FormContainer