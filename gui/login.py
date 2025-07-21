import streamlit as st
from datetime import date
import os


api_url = os.getenv("API_URL")



def main():

    # depois em vez de usar uma lista usamos a API que depois chama a BD
    bookings = []

    st.set_page_config(page_title="Office Booking", page_icon="🏢")
    st.title("🏢 Office Booking System")

    st.markdown("Select a day and time slot to book your place at the office.")

    # Booking form
    with st.form("booking_form"):
        selected_date = st.date_input("📅 Choose a date", min_value=date.today())
        time_slot = st.radio(
            "🕒 Choose a time slot",
            options=["Morning", "Afternoon", "Whole Day"]
        )
        name = st.text_input("👤 Your name")

        submitted = st.form_submit_button("Book")

        if submitted:
            if not name:
                st.error("Please enter your name.")
            else:
                booking = {"name": name, "date": selected_date, "slot": time_slot}
                bookings.append(booking)
                st.success(f"Booking confirmed for {name} on {selected_date} ({time_slot})")

    # Display current bookings
    if bookings:
        st.markdown("### 📋 Current Bookings")
        for b in bookings:
            st.write(f"{b['name']} - {b['date']} ({b['slot']})")


if __name__ == "__main__":
    main()
