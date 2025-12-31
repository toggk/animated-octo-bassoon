def speed_generator(initial_speed=0, acceleration=1, time_step=1):
    """
    Generate speed values based on constant acceleration.
    
    Parameters:
    -----------
    initial_speed : float
        Starting speed (default: 0)
    acceleration : float
        Rate of change of speed per time step (default: 1)
    time_step : float
        Time interval between generated values (default: 1)
    
    Yields:
    -------
    float
        Current speed at each time step
    """
    current_speed = initial_speed
    
    while True:
        yield current_speed
        current_speed += acceleration * time_step

def compute_force(mass, initial_speed,final_speed, time_interval):
    """
    Compute force using F = ma, derived from change in speed.
    
    Force = mass × acceleration
    Acceleration = (final_speed - initial_speed) / time_interval
    
    Parameters:
    -----------
    mass : float
        Mass of the object (kg)
    initial_speed : float
        Initial speed (m/s)
    final_speed : float
        Final speed (m/s)
    time_interval : float
        Time over which speed change occurs (seconds)
    
    Returns:
    --------
    float
        Force in Newtons (N)
    """
    acceleration = (final_speed - initial_speed) / time_interval
    force = mass * acceleration
    return force
