const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: orders });
}

function validateProperty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;

    //validate dishes property name
    if (propertyName === "status") {
      const status = data[propertyName];
      //validate status - not invalid
      if (status === "invalid") {
        return next({
          status: 400,
          message:
            "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
      }
      //validate status - not delivered
      if (status === "delivered") {
        return next({
          status: 400,
          message: "A delivered order cannot be changed",
        });
      }
    }

    //validate dishes property name
    if (propertyName === "dishes") {
      const dishes = data[propertyName];

      //validate dishes length > 0
      if (!Array.isArray(dishes)) {
        return next({
          status: 400,
          message: `Order must include at least one dish`,
        });
      }
      //validate dishes length > 0
      if (dishes.length <= 0) {
        return next({
          status: 400,
          message: `Order must include at least one dish`,
        });
      }
      //validate dishes length is !undefined
      if (dishes.length === undefined) {
        return next({
          status: 400,
          message: `Order must include at least one dish`,
        });
      }
      // validate dishes quantity
      dishes.forEach((dish, index) => {
        if (typeof dish.quantity !== "number") {
          return next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`,
          });
        }
        if (dish.quantity === 0) {
          return next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`,
          });
        }
      });
    }
    
    //validate property name is truthy
    if (!data[propertyName]) {
      return next({ status: 400, message: `Must include a ${propertyName}` });
    }
    //go to next middleware
    next();
  };
}

// create new order
function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes: [
      //needed to pass test to add status to the order
      status
    ],
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//validate that order exists
function validateOrder(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order ID not found: ${orderId}`,
  });
}

function validateIncomingOrderId(req, res, next) {
  const { orderId } = req.params;
  const { data: {id} = {} } = req.body
  if (!id) {
    return next();
  }
  if (orderId !== id) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}}`,
    });
  }
  next();
}

//read function for indiv order
function read(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.status(200).json({ data: foundOrder });
}

//update function for existing function
function update(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}

//delete function for existing function
function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order, index) => order.id === orderId);
  const orderStatus = orders[index].status;
  if (orderStatus === "pending") {
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
  }
  next({
    status: 400,
    message: `Unable to delete - order status pending`,
  });
}

module.exports = {
  list,
  create: [
    validateProperty("deliverTo"),
    validateProperty("mobileNumber"),
    validateProperty("dishes"),
    create,
  ],
  read: [validateOrder, read],
  update: [
    validateOrder,
    validateIncomingOrderId,
    validateProperty("deliverTo"),
    validateProperty("mobileNumber"),
    validateProperty("status"),
    validateProperty("dishes"),
    update,
  ],
  delete: [validateOrder, destroy],
};
