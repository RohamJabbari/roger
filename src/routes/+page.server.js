export const prerender = false;

export const actions = {
  'prompt-transcript': async ({request}) => {
    try {
      const formData = await request.formData();
      const userPrompt = formData.get('user_prompt');
      const recordingId = formData.get('recording_id');

      console.log('userPrompt:', userPrompt);

      const response = await fetch('http://localhost:5000/prompt-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_prompt: userPrompt,
          recording_id: recordingId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const data = await response.json();
      return data;

      // return { message_ids: [
      //     3, 24, 42, 48, 52,  60,
      //   62, 72, 80, 91, 97, 104,
      //   106
      // ] };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }

		// const data = prepareTripData(formData);
		/* let success = false;
		
		try {
			let response;
			if (data.id) {
				response = await api.put(`trips/${data.id}`, data, locals.user?.token);
			} else {
				response = await api.post('trips', data, locals.user?.token);
			}
			success = response.error ? false : true;
		} catch (error) {
			success = false;
		}

		if (success) {
			if (!data.id) { // new trip
				let nUserTrips = locals.user.n_trips + 1;
				updateUserAttributeCookie(cookies, locals.user, 'n_trips', nUserTrips);
			}
			return { success: true };
		} else {
			return fail(500, { error: true });
		} */
	}
};