<template>
  <main class="landing">
    <h1>What is GameHub?</h1>
    <div class="info-box">
      <p>
        GameHub is a combination of my own made games and a platform for people to socialize and share their own favorite games.
        Here you can play, discover, and connect with others who love games as much as you do!
      </p>
      <router-link to="/" class="home-btn">See my homemade games</router-link>
      <router-link to="/profile" class="create-user-btn">Create User</router-link>
    </div>
  </main>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: #C0C0C0;
  padding-top: 4rem;
}

h1 {
  color: #6C619E;
  margin-bottom: 2rem;
  font-size: 2.2rem;
}

.info-box {
  background: #C0C0C0;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.07);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-box p {
  color: #333;
  font-size: 1.15rem;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

.home-btn {
  padding: 0.5rem 1.5rem;
  background-color: #6C619E;
  color: white;
  font-size: 1rem;
  transition: background-color 0.2s;
  cursor: pointer;
}
.home-btn:hover {
  background-color: #554d7a;
}

.create-user-btn {
  padding: 0.5rem 1.5rem;
  background-color: #28a745;
  color: white;
  font-size: 1rem;
  transition: background-color 0.2s;
  cursor: pointer;
  margin-top: 1rem;
  text-decoration: none;
  border-radius: 4px;
}

.create-user-btn:hover {
  background-color: #218838;
}
</style>
