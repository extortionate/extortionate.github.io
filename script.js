document.addEventListener('DOMContentLoaded', function () {
    // Function to update the current time
    function updateTime() {
        const currentTimeElement = document.getElementById('current-time');
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const timeString = now.toLocaleTimeString('en-US', options); // Use 'en-US' for 12-hour format
        currentTimeElement.textContent = timeString;
    }

    // Update the time every second
    setInterval(updateTime, 1000);

    // Initial time display
    updateTime();

    // Starfield canvas animation
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 200;
    const numTwinklingStars = 100;  // Number of stars that will twinkle
    let shootingStar = null; // Only one shooting star

    // Resize canvas to match the window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();

    // Create stars with fixed positions
    function createStars() {
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                velocity: Math.random() * 0.5 + 0.2,
                isTwinkling: i < numTwinklingStars,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    createStars();

    // Function to create a shooting star
    function createShootingStar() {
        const startSide = Math.floor(Math.random() * 4); // Random direction (0: left, 1: top, 2: right, 3: bottom)
        let x, y, length, velocity;

        switch (startSide) {
            case 0: // Coming from left
                x = -30; // Start off-screen to the left
                y = Math.random() * canvas.height;
                velocity = Math.random() * 4 + 2;
                break;
            case 1: // Coming from the top
                x = Math.random() * canvas.width;
                y = -30; // Start off-screen above
                velocity = Math.random() * 4 + 2;
                break;
            case 2: // Coming from right
                x = canvas.width + 30; // Start off-screen to the right
                y = Math.random() * canvas.height;
                velocity = -(Math.random() * 4 + 2);
                break;
            case 3: // Coming from the bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 30; // Start off-screen below
                velocity = -(Math.random() * 4 + 2);
                break;
        }

        length = Math.random() * 30 + 20; // Random length
        shootingStar = {
            x: x,
            y: y,
            length: length,
            velocity: velocity,
            active: true,
            twinklePhase: Math.random() * Math.PI * 2 // For twinkle effect
        };
    }

    // Animate the stars and shooting stars
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw and animate regular stars
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

            if (star.isTwinkling) {
                const twinkleValue = (Math.sin(star.twinklePhase) + 1) / 2;
                const r = Math.floor(0 * (1 - twinkleValue));
                const g = Math.floor(204 * (1 - twinkleValue));
                const b = 255;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                star.twinklePhase += 0.02; // Slow twinkle speed
            } else {
                ctx.fillStyle = '#ffffff';
            }
            ctx.fill();

            // Move star downwards
            star.y += star.velocity;

            // Reset position if star moves off-screen
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        // Draw and animate the shooting star
        if (shootingStar && shootingStar.active) {
            // Draw the shooting star's tail
            ctx.beginPath();
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStar.length, shootingStar.y - shootingStar.length / 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;

            // Add a twinkling effect with lower opacity
            ctx.globalAlpha = 0.1 * (Math.sin(shootingStar.twinklePhase) + 1); // Reduced twinkle effect
            ctx.stroke();
            ctx.globalAlpha = 1; // Reset alpha for other drawings

            // Move shooting star diagonally
            shootingStar.x += shootingStar.velocity; // Move based on velocity
            shootingStar.y += shootingStar.velocity / 2; // Move slightly down

            // Reset position if shooting star moves off-screen
            if (shootingStar.x < -30 || shootingStar.x > canvas.width + 30 || 
                shootingStar.y < -30 || shootingStar.y > canvas.height + 30) {
                shootingStar.active = false; // Mark it as inactive
            }

            // Update twinkle phase for the effect (slower twinkle speed)
            shootingStar.twinklePhase += 0.01; // Reduced increment for slower twinkle
        } else if (!shootingStar || !shootingStar.active) {
            // Random chance to create a new shooting star
            if (Math.random() < 0.01) {
                createShootingStar();
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Update canvas size if window is resized
    window.addEventListener('resize', resizeCanvas);
});
