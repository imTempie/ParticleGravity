// Module aliases
const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Constraint } =
  Matter;

// Create an engine
var engine = Engine.create({
  positionIterations: 8,
  velocityIterations: 8,
});

engine.world.gravity.y = 0; // Disable gravity
engine.world.gravity.x = 0; // Disable gravity

// Create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 1920,
    height: 1080,
    wireframes: false,
  },
});

const createStaticRectangle = (x, y, width, height) =>
  Bodies.rectangle(x, y, width, height, { isStatic: true });

const wallThickness = 60;

const createWall = (x, y, width, height) =>
  createStaticRectangle(x, y, width, height);

// create ground, ceiling, left wall, right wall, to make a 1920 x 1080 box
const ground = createWall(960, 1080 - wallThickness / 2, 1920, wallThickness);
const ceiling = createWall(960, wallThickness / 2, 1920, wallThickness);
const wallLeft = createWall(wallThickness / 2, 540, wallThickness, 1080);
const wallRight = createWall(
  1920 - wallThickness / 2,
  540,
  wallThickness,
  1080
);

World.add(engine.world, [ground, ceiling, wallLeft, wallRight]);

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

World.add(engine.world, mouseConstraint);

// Keep the mouse in sync with rendering
render.mouse = mouse;

// Run the engine and the renderer
Engine.run(engine);
Render.run(render);

// Create an array to store the particles
var particles = [];

document.getElementById('addParticles').addEventListener('click', function () {
  var count = document.getElementById('particleCount').value;
  var size = document.getElementById('particleSize').value;
  for (var i = 0; i < count; i++) {
    const x = 100 + Math.random() * (1920 - 200);
    const y = 100 + Math.random() * (1080 - 200);

    var particle = Bodies.circle(x, y, size, {
      restitution: 0.1,
    });
    console.log('Particle spawned at: ' + x + ', ' + y);
    World.add(engine.world, particle);
    // Add the particle to the array
    particles.push(particle);
  }
});

document
  .getElementById('removeParticles')
  .addEventListener('click', function () {
    // Remove all the particles from the world
    for (var i = 0; i < particles.length; i++) {
      World.remove(engine.world, particles[i]);
    }
    // Clear the array
    particles = [];
  });

// Create an array to store the planets
var planets = [];

document.getElementById('addPlanets').addEventListener('click', function () {
  const size = document.getElementById('planetSize').value;
  const gravity = document.getElementById('planetGravity').value;
  const x = 100 + Math.random() * (1920 - 200);
  const y = 100 + Math.random() * (1080 - 200);

  var planet = Bodies.circle(x, y, size, {
    gravity: gravity,
    isStatic: false,
    isPlanet: true,
    render: {
      fillStyle: '#ffffff',
    },
    restitution: 0.8,
  });
  World.add(engine.world, planet);
  console.log('Planet spawned at: ' + x + ', ' + y);
  // Add the planet to the array
  planets.push(planet);
});

document.getElementById('removePlanets').addEventListener('click', function () {
  // Remove all the planets from the world
  for (var i = 0; i < planets.length; i++) {
    World.remove(engine.world, planets[i]);
  }
  // Clear the array
  planets = [];
});

Matter.Events.on(engine, 'afterUpdate', function () {
  console.log('afterUpdate event fired');

  for (var i = 0; i < engine.world.bodies.length; i++) {
    var body = engine.world.bodies[i];

    // Skip if the body is a planet
    if (body.isPlanet) {
      continue;
    }

    for (var j = 0; j < planets.length; j++) {
      var planet = planets[j];

      // Calculate the vector from the body to the planet
      var dx = planet.position.x - body.position.x;
      var dy = planet.position.y - body.position.y;
      var distanceSq = dx * dx + dy * dy;

      // Normalize the vector
      var magnitude = Math.sqrt(distanceSq);
      dx /= magnitude;
      dy /= magnitude;

      // Calculate the gravitational force
      var G = planet.gravity; // Use the planet's gravity
      var forceMagnitude = (G * body.mass * planet.mass) / (distanceSq + 0.01);

      // Apply the force only to particles, not planets
      if (!body.isPlanet) {
        Matter.Body.applyForce(body, body.position, {
          x: forceMagnitude * dx,
          y: forceMagnitude * dy,
        });
      }
    }
  }
});
