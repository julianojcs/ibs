// Script de teste para verificar conexão com MongoDB
// Executar com: npx tsx scripts/test-mongodb.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import mongoose from 'mongoose'

async function testConnection() {
	console.log('🔄 Testando conexão com MongoDB...\n')

	const uri = process.env.MONGODB_URI

	if (!uri) {
		console.error('❌ MONGODB_URI não está definida no .env.local')
		process.exit(1)
	}

	// Mascarar senha para log
	const maskedUri = uri.replace(/:([^:@]+)@/, ':****@')
	console.log('📍 URI:', maskedUri)

	try {
		console.log('\n🔗 Conectando...')
		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 5000,
		})

		console.log('✅ Conexão com MongoDB estabelecida com sucesso!')
		console.log('📊 Database:', mongoose.connection.db?.databaseName)

		// Listar collections
		const collections = await mongoose.connection.db?.listCollections().toArray()
		console.log('📁 Collections:', collections?.map(c => c.name).join(', ') || 'nenhuma')

		await mongoose.disconnect()
		console.log('\n🔌 Desconectado com sucesso.')

	} catch (error) {
		console.error('\n❌ Erro ao conectar:')
		console.error(error)
		process.exit(1)
	}
}

testConnection()
