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
